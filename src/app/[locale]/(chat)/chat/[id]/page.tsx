'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { BouncingDots } from '@/components/general/BouncingDots';
import { useAuth } from '@/context/AuthContext';
import { useChatMessages, useChatNavigation } from '@/context/ChatContext';
import { api } from '@/libs/api';

type Message = {
  id: number;
  text: string | undefined;
  sender: 'user' | 'character';
  time: string;
  date: string;
};

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
  const { id } = use(props.params);
  const { activeChat, setActiveChat, bumpChatList } = useChatNavigation();
  const { setMessages, setNextCursor, setHasMoreMessages } = useChatMessages();
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!id || !token) {
      return;
    }

    setActiveChat(null);
    setMessages([]);

    api.post('/chat/start', { character_id: id }, token).then((res) => {
      const c = res?.content;
      if (!c?.chatroom_id) {
        router.replace('/chat');
        return;
      }

      const greetingMessage = (c.character?.greeting_message as string) ?? '';
      setActiveChat({
        chatroomId: c.chatroom_id as string,
        characterId: id,
        name: (c.character?.name as string) ?? '',
        image: (c.character?.image_url as string) ?? '',
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
        api.get(`/chat/${c.chatroom_id as string}/messages`, token).then((msgRes) => {
          const items: unknown = msgRes?.content?.messages ?? msgRes?.messages ?? msgRes?.content?.items ?? msgRes?.content ?? msgRes?.data;
          if (Array.isArray(items)) {
            const mapped: Message[] = [...(items as Record<string, unknown>[])].reverse().map((m, i) => {
              const ts = m.timestamp ? new Date(m.timestamp as number) : null;
              return {
                id: i,
                text: (m.text ?? m.content ?? m.message) as string | undefined,
                sender: m.sender_type === 'user' ? 'user' : 'character',
                time: ts ? formatTime(ts.toISOString()) : '',
                date: ts ? formatDate(ts.toISOString()) : 'Today',
              };
            });
            setMessages(mapped);
            setNextCursor((msgRes?.content?.nextCursor as string) ?? null);
            setHasMoreMessages(!!(msgRes?.content?.nextCursor));
          }
        });
      }
    }).catch(() => {
      router.replace('/chat');
    });
  }, [id, token]);

  if (!activeChat) {
    return (
      <div className="flex h-full items-center justify-center text-white-75">
        <BouncingDots />
      </div>
    );
  }

  return <ChatRoom />;
}
