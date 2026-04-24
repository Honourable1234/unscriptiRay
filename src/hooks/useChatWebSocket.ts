'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { api } from '@/libs/api';
import { Env } from '@/libs/Env';
import { supabase } from '@/libs/supabase';

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
  const { activeChat, setMessages, setIsTyping } = useChat();
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

  const ensureOpen = useCallback(async (): Promise<WebSocket> => {
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
    const freshToken = data.session?.access_token;
    if (!freshToken) {
      throw new Error('no_token');
    }
    const fullUrl = `${wsUrl}?token=${encodeURIComponent(freshToken)}`;
    const ws = new WebSocket(fullUrl);
    wsRef.current = ws;
    await waitForOpen(ws);
    return ws;
  }, []);

  const send = useCallback(async (content: string): Promise<void> => {
    if (!activeChat || !user || !token) {
      return;
    }

    const userMsg = {
      id: Date.now(),
      text: content,
      sender: 'user' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

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
        userId: user.id,
        content,
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
          setMessages((prev) => {
            const hasStreaming = prev.some(m => m.id === streamingId);
            if (hasStreaming) {
              return prev.map(m =>
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
          setMessages(prev =>
            prev.map(m => m.id === streamingId ? { ...m, text: msg.data } : m),
          );
        }

        if (
          msg.type === 'cache_miss'
          || (msg.type === 'error' && msg.code === 'CREDITS_NOT_CACHED')
        ) {
          if (!retried) {
            retried = true;
            api.post('/chat/start', { character_id: activeChat.characterId }, token)
              .then(() => doSend())
              .catch(() => setIsTyping(false));
          } else {
            setIsTyping(false);
          }
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
  }, [activeChat, user, token, ensureOpen, setMessages, setIsTyping]);

  return { send };
};
