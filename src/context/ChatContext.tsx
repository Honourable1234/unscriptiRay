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

type ChatNavigationContextValue = {
  activeView: ChatView;
  setActiveView: (view: ChatView) => void;
  activeChat: ActiveChat;
  setActiveChat: (chat: ActiveChat) => void;
  voiceId: string | null;
  setVoiceId: (voiceId: string | null) => void;
  chatListVersion: number;
  bumpChatList: () => void;
};

type ChatMessagesContextValue = {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  nextCursor: string | null;
  setNextCursor: (cursor: string | null) => void;
  hasMoreMessages: boolean;
  setHasMoreMessages: (has: boolean) => void;
  guestLimitReached: boolean;
  setGuestLimitReached: (reached: boolean) => void;
};

const ChatNavigationContext = createContext<ChatNavigationContextValue>({
  activeView: 'chat',
  setActiveView: () => {},
  activeChat: null,
  setActiveChat: () => {},
  voiceId: null,
  setVoiceId: () => {},
  chatListVersion: 0,
  bumpChatList: () => {},
});

const ChatMessagesContext = createContext<ChatMessagesContextValue>({
  messages: [],
  setMessages: () => {},
  isTyping: false,
  setIsTyping: () => {},
  nextCursor: null,
  setNextCursor: () => {},
  hasMoreMessages: false,
  setHasMoreMessages: () => {},
  guestLimitReached: false,
  setGuestLimitReached: () => {},
});

export const ChatProvider = (props: { children: React.ReactNode }) => {
  const [activeView, setActiveView] = useState<ChatView>('chat');
  const [activeChat, setActiveChat] = useState<ActiveChat>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [chatListVersion, setChatListVersion] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [guestLimitReached, setGuestLimitReached] = useState(false);
  const bumpChatList = () => setChatListVersion(v => v + 1);

  return (
    <ChatNavigationContext value={{ activeView, setActiveView, activeChat, setActiveChat, voiceId, setVoiceId, chatListVersion, bumpChatList }}>
      <ChatMessagesContext value={{ messages, setMessages, isTyping, setIsTyping, nextCursor, setNextCursor, hasMoreMessages, setHasMoreMessages, guestLimitReached, setGuestLimitReached }}>
        {props.children}
      </ChatMessagesContext>
    </ChatNavigationContext>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChatNavigation = () => use(ChatNavigationContext);
// eslint-disable-next-line react-refresh/only-export-components
export const useChatMessages = () => use(ChatMessagesContext);
