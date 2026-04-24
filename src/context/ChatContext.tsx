'use client';

import type { Message } from '@/components/chat/types';
import { createContext, use, useState } from 'react';

type ChatView = 'chat' | 'group' | 'scenario';

type ActiveChat = {
  chatroomId: string;
  characterId: string;
  name: string;
  image: string;
  greetingMessage: string;
} | null;

type ChatContextValue = {
  activeView: ChatView;
  setActiveView: (view: ChatView) => void;
  activeChat: ActiveChat;
  setActiveChat: (chat: ActiveChat) => void;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  chatListVersion: number;
  bumpChatList: () => void;
  nextCursor: string | null;
  setNextCursor: (cursor: string | null) => void;
  hasMoreMessages: boolean;
  setHasMoreMessages: (has: boolean) => void;
};

const ChatContext = createContext<ChatContextValue>({
  activeView: 'chat',
  setActiveView: () => {},
  activeChat: null,
  setActiveChat: () => {},
  messages: [],
  setMessages: () => {},
  isTyping: false,
  setIsTyping: () => {},
  chatListVersion: 0,
  bumpChatList: () => {},
  nextCursor: null,
  setNextCursor: () => {},
  hasMoreMessages: false,
  setHasMoreMessages: () => {},
});

export const ChatProvider = (props: { children: React.ReactNode }) => {
  const [activeView, setActiveView] = useState<ChatView>('chat');
  const [activeChat, setActiveChat] = useState<ActiveChat>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatListVersion, setChatListVersion] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const bumpChatList = () => setChatListVersion(v => v + 1);

  return (
    <ChatContext value={{ activeView, setActiveView, activeChat, setActiveChat, messages, setMessages, isTyping, setIsTyping, chatListVersion, bumpChatList, nextCursor, setNextCursor, hasMoreMessages, setHasMoreMessages }}>
      {props.children}
    </ChatContext>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => use(ChatContext);
