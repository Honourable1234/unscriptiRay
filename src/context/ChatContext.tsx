'use client';

import { createContext, use, useState } from 'react';

type ChatView = 'chat' | 'group' | 'scenario';

type ChatContextValue = {
  activeView: ChatView;
  setActiveView: (view: ChatView) => void;
};

const ChatContext = createContext<ChatContextValue>({
  activeView: 'chat',
  setActiveView: () => {},
});

export const ChatProvider = (props: { children: React.ReactNode }) => {
  const [activeView, setActiveView] = useState<ChatView>('chat');

  return (
    <ChatContext value={{ activeView, setActiveView }}>
      {props.children}
    </ChatContext>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => use(ChatContext);
