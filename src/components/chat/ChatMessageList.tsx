'use client';

import type { Message } from './types';
import { useEffect, useRef } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { useChatMessages, useChatNavigation } from '@/context/ChatContext';
import { useChatService } from '@/services/useChatService';
import { ChatMessageBubble } from './ChatMessageBubble';

const groupByDate = (messages: Message[]) => {
  const map: Record<string, Message[]> = {};
  for (const msg of messages) {
    if (!map[msg.date]) {
      map[msg.date] = [];
    }
    map[msg.date]!.push(msg);
  }
  return map;
};

export const ChatMessageList = (props: {
  messages: Message[];
  characterName: string;
  characterImage: string;
  backgroundImage?: string;
}) => {
  const { activeChat } = useChatNavigation();
  const { isTyping, setMessages, nextCursor, setNextCursor, setHasMoreMessages } = useChatMessages();
  const { getMessages } = useChatService();
  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const grouped = groupByDate(props.messages);

  const handleDeleteMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleDuplicateFromMessage = (id: number) => {
    setMessages((prev) => {
      const index = prev.findIndex(m => m.id === id);
      if (index === -1) {
        return prev;
      }
      const maxId = Math.max(...prev.map(m => m.id));
      const clones = prev.slice(index).map((m, i) => ({ ...m, id: maxId + i + 1 }));
      return [...prev, ...clones];
    });
  };

  const handleEditMessage = (id: number, text: string) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, text } : m)));
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = scrollRef.current;
      el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(id);
  }, [props.messages, isTyping]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    const scrollEl = scrollRef.current;
    if (!sentinel || !scrollEl) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || loadingMoreRef.current || !nextCursor || !activeChat) {
          return;
        }
        loadingMoreRef.current = true;
        const prevHeight = scrollEl.scrollHeight;
        getMessages(activeChat.chatroomId, nextCursor).then((msgRes) => {
          const items: unknown = msgRes?.content?.messages ?? msgRes?.messages ?? msgRes?.content?.items ?? msgRes?.content ?? msgRes?.data;
          if (Array.isArray(items)) {
            const mapped: Message[] = [...(items as Record<string, unknown>[])].reverse().map((m, i) => {
              const ts = m.timestamp ? new Date(m.timestamp as number) : null;
              return {
                id: i,
                messageId: (m.id ?? m.message_id ?? m._id) as string | undefined,
                text: (m.text ?? m.content ?? m.message) as string | undefined,
                sender: m.sender_type === 'user' ? 'user' as const : 'character' as const,
                time: ts ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                date: ts ? (ts.toDateString() === new Date().toDateString() ? 'Today' : ts.toLocaleDateString([], { month: 'short', day: 'numeric' })) : 'Today',
              };
            });
            setMessages((prev: Message[]) => [...mapped, ...prev]);
            setNextCursor((msgRes?.content?.nextCursor as string) ?? null);
            setHasMoreMessages(!!(msgRes?.content?.nextCursor));
            requestAnimationFrame(() => {
              scrollEl.scrollTop = scrollEl.scrollHeight - prevHeight;
            });
          }
        }).catch(() => {}).finally(() => {
          loadingMoreRef.current = false;
        });
      },
      { root: scrollEl, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [nextCursor, activeChat, setMessages, setNextCursor, setHasMoreMessages]);

  return (
    <div
      ref={scrollRef}
      style={props.backgroundImage ? { backgroundImage: `url(${props.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      className="relative flex-1 overflow-y-auto bg-black backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div ref={topSentinelRef} className="h-px" />
      <div className="relative z-20 mx-auto max-w-3xl px-4 pt-4 pb-40">
        {Object.entries(grouped).map(([date, msgs]) => (
          <div className="mb-10" key={date}>
            <div className="my-4 flex items-center justify-center md:my-7.5">
              <span className="text-sm text-white">{date}</span>
            </div>

            {msgs.map(msg => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                onDelete={handleDeleteMessage}
                onDuplicate={handleDuplicateFromMessage}
                onEdit={handleEditMessage}
              />
            ))}
          </div>
        ))}

        {isTyping && (
          <div className="mb-3 flex items-end gap-2">
            <div className="rounded-2xl rounded-bl-sm bg-black-80 px-6 py-4 text-white [&>span>span]:size-3.5">
              <BouncingDots />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
