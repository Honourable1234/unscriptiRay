'use client';

import type { Message } from '@/components/chat/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { BouncingDots } from '@/components/general/BouncingDots';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { api } from '@/libs/api';

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function ChatIdPage(props: { params: Promise<{ id: string }> }) {
  const { activeChat, setActiveChat, setMessages, bumpChatList } = useChat();
  const { token, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    setActiveChat(null);
    setMessages([]);

    props.params.then(({ id }) => {
      api.post('/chat/start', { character_id: id }, token ?? undefined).then((res) => {
        console.warn('[ChatIdPage] /chat/start response:', res);
        const c = res?.content;
        if (!c?.chatroom_id) {
          router.replace('/chat');
          return;
        }

        const greetingMessage = c.character?.greeting_message as string ?? '';
        setActiveChat({
          chatroomId: c.chatroom_id as string,
          characterId: id,
          name: c.character?.name as string ?? '',
          image: c.character?.image_url as string ?? '',
          greetingMessage,
        });

        if (c.is_new && greetingMessage) {
          setMessages([{
            id: 0,
            text: greetingMessage,
            sender: 'character',
            time: '',
            date: 'Today',
          }]);
          bumpChatList();
        }

        if (!c.is_new) {
          api.get(`/chat/${c.chatroom_id}/messages`, token ?? undefined).then((msgRes) => {
            console.warn('[ChatIdPage] /chat/messages response:', msgRes);
            const items: unknown = msgRes?.content?.items ?? msgRes?.content ?? msgRes?.data;
            if (Array.isArray(items)) {
              const mapped: Message[] = (items as Record<string, unknown>[]).map((m, i) => ({
                id: typeof m.id === 'number' ? m.id : i,
                text: (m.content ?? m.text ?? m.message) as string | undefined,
                sender: (m.sender_type === 'user' || m.role === 'user') ? 'user' : 'character',
                time: m.created_at ? formatTime(m.created_at as string) : '',
                date: m.created_at ? formatDate(m.created_at as string) : 'Today',
              }));
              setMessages(mapped);
            }
          });
        }
      }).catch(() => {
        router.replace('/chat');
      });
    });
  }, [authLoading]);

  if (!activeChat) {
    return (
      <div className="flex h-full items-center justify-center text-white-75">
        <BouncingDots />
      </div>
    );
  }

  return <ChatRoom />;
}
