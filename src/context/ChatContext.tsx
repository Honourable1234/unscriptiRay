'use client';

import { createContext, use, useState } from 'react';

type ChatView = 'chat' | 'group' | 'scenario';

type ActiveChat = {
  name: string;
  image: string;
} | null;

type ChatContextValue = {
  activeView: ChatView;
  setActiveView: (view: ChatView) => void;
  activeChat: ActiveChat;
  setActiveChat: (chat: ActiveChat) => void;
};

const ChatContext = createContext<ChatContextValue>({
  activeView: 'chat',
  setActiveView: () => {},
  activeChat: null,
  setActiveChat: () => {},
});

export const ChatProvider = (props: { children: React.ReactNode }) => {
  const [activeView, setActiveView] = useState<ChatView>('chat');
  const [activeChat, setActiveChat] = useState<ActiveChat>(null);

  return (
    <ChatContext value={{ activeView, setActiveView, activeChat, setActiveChat }}>
      {props.children}
    </ChatContext>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => use(ChatContext);
