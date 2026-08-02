'use client';

import type { Message } from '@/components/chat/types';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChatMessages, useChatNavigation } from '@/context/ChatContext';
import { useWallet } from '@/context/WalletContext';
import { ApiError } from '@/libs/api';
import { Env } from '@/libs/Env';
import { guestToken } from '@/libs/guestToken';
import { supabase } from '@/libs/supabase';
import { useChatService } from '@/services/useChatService';

type WsChunkEvent = { type: 'chunk'; data: string };
type WsCompleteEvent = { type: 'complete'; data: string };
type WsAudioEvent = { type: 'audio'; data: string };
type WsCacheMissEvent = { type: 'cache_miss'; data: unknown };
type WsErrorEvent = { type: 'error'; error: string; code: string };
type WsEvent = WsChunkEvent | WsCompleteEvent | WsAudioEvent | WsCacheMissEvent | WsErrorEvent;

const waitForOpen = (ws: WebSocket): Promise<void> =>
  new Promise((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }
    function onOpen() {
      ws.removeEventListener('open', onOpen);
      ws.removeEventListener('error', onErr);
      resolve();
    }
    function onErr() {
      ws.removeEventListener('open', onOpen);
      ws.removeEventListener('error', onErr);
      reject(new Error('WebSocket connection failed'));
    }
    ws.addEventListener('open', onOpen);
    ws.addEventListener('error', onErr);
  });

/** Manages a persistent WebSocket connection for streaming chat responses. */
export const useChatWebSocket = () => {
  const { token, user } = useAuth();
  const { activeChat, voiceId } = useChatNavigation();
  const { setMessages, setIsTyping, setGuestLimitReached } = useChatMessages();
  const { startChat, sendMessage } = useChatService();
  const { refresh: refreshWallet } = useWallet();
  const wsRef = useRef<WebSocket | null>(null);

  // Close the socket when the token changes (e.g. sign-out) so ensureOpen reconnects fresh.
  useEffect(() => {
    return () => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [token]);

  const ensureOpen = async (): Promise<WebSocket> => {
    const wsUrl = Env.NEXT_PUBLIC_WS_URL?.replace(/\/+$/, '');
    if (!wsUrl) {
      throw new Error('no_ws_url');
    }
    const current = wsRef.current;
    if (current && current.readyState !== WebSocket.CLOSED && current.readyState !== WebSocket.CLOSING) {
      await waitForOpen(current);
      return current;
    }
    const { data } = await supabase.auth.getSession();
    const freshToken = data.session?.access_token ?? guestToken.get();
    if (!freshToken) {
      throw new Error('no_token');
    }
    const fullUrl = `${wsUrl}?token=${encodeURIComponent(freshToken)}`;
    const ws = new WebSocket(fullUrl);
    wsRef.current = ws;
    await waitForOpen(ws);
    return ws;
  };

  const send = async (content: string): Promise<void> => {
    if (!activeChat || (!token && !guestToken.get())) {
      return;
    }

    const userMsg = {
      id: Date.now(),
      text: content,
      sender: 'user' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
    };
    setMessages((prev: Message[]) => [...prev, userMsg]);
    setIsTyping(true);

    // The WS gateway rejects guest tokens outright, so guests send over REST instead.
    if (!token) {
      const sendAsGuest = async (retry = true): Promise<void> => {
        try {
          const res = await sendMessage(activeChat.chatroomId, { content });
          const aiText = (res as { content?: { ai_message?: { text?: string } } })?.content?.ai_message?.text;
          setIsTyping(false);
          // The reply is charged as it lands, so the shown balance is stale until re-read.
          refreshWallet();
          if (aiText) {
            setMessages((prev: Message[]) => [...prev, {
              id: Date.now() + 1,
              text: aiText,
              sender: 'character' as const,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: 'Today',
            }]);
          }
        } catch (err) {
          if (err instanceof ApiError && err.code === 'GUEST_LIMIT_REACHED') {
            setIsTyping(false);
            setMessages((prev: Message[]) => prev.filter((m: Message) => m.id !== userMsg.id));
            setGuestLimitReached(true);
            return;
          }
          // Guest token expired (~10 min TTL): mint a fresh one and retry once.
          if (err instanceof ApiError && err.status === 401 && retry) {
            guestToken.clear();
            try {
              await startChat(activeChat.characterId);
              await sendAsGuest(false);
              return;
            } catch {
              // fall through to generic failure handling below
            }
          }
          setIsTyping(false);
        }
      };

      await sendAsGuest();
      return;
    }

    const streamingId = Date.now() + 1;
    let retried = false;

    const doSend = async (): Promise<void> => {
      let ws: WebSocket;
      try {
        ws = await ensureOpen();
      } catch {
        setIsTyping(false);
        return;
      }

      const payload = {
        action: 'web_chat',
        chatroomId: activeChat.chatroomId,
        userId: user?.id,
        content,
        ...(voiceId ? { voiceId } : {}),
      };
      ws.send(JSON.stringify(payload));

      ws.onmessage = (event: MessageEvent<string>) => {
        let msg: WsEvent;
        try {
          msg = JSON.parse(event.data) as WsEvent;
        } catch {
          return;
        }

        if (msg.type === 'chunk') {
          setIsTyping(false);
          setMessages((prev: Message[]) => {
            const hasStreaming = prev.some((m: Message) => m.id === streamingId);
            if (hasStreaming) {
              return prev.map((m: Message) =>
                m.id === streamingId ? { ...m, text: (m.text ?? '') + msg.data } : m,
              );
            }
            return [...prev, {
              id: streamingId,
              text: msg.data,
              sender: 'character' as const,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: 'Today',
            }];
          });
        }

        if (msg.type === 'complete') {
          setIsTyping(false);
          setMessages((prev: Message[]) =>
            prev.map((m: Message) => m.id === streamingId ? { ...m, text: msg.data } : m),
          );
          // The reply is charged as it lands, so the shown balance is stale until re-read.
          refreshWallet();
        }

        if (
          msg.type === 'cache_miss'
          || (msg.type === 'error' && msg.code === 'CREDITS_NOT_CACHED')
        ) {
          if (!retried) {
            retried = true;
            startChat(activeChat.characterId)
              .then(() => doSend())
              .catch(() => setIsTyping(false));
          } else {
            setIsTyping(false);
          }
        }

        if (msg.type === 'error' && msg.code === 'GUEST_LIMIT_REACHED') {
          setIsTyping(false);
          // Roll back the rejected message and surface the sign-up prompt.
          setMessages((prev: Message[]) => prev.filter((m: Message) => m.id !== userMsg.id));
          setGuestLimitReached(true);
          return;
        }

        if (msg.type === 'error' && msg.code !== 'CREDITS_NOT_CACHED') {
          setIsTyping(false);
        }
      };
    };

    try {
      await doSend();
    } catch {
      setIsTyping(false);
    }
  };

  return { send };
};
