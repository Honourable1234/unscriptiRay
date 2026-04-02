'use client';

import { ChatSideBar } from '@/components/chat/ChatSideBar';
import { NavBar } from '@/components/dashboard/NavBar';
import { useChat } from '@/context/ChatContext';

export const ChatTemplate = (props: { children: React.ReactNode }) => {
  const { activeChat } = useChat();

  return (
    <div className="flex h-screen overflow-hidden bg-black-80">
      <aside className="h-screen flex-shrink-0">
        <ChatSideBar />
      </aside>
      <div className="flex w-full flex-col overflow-hidden">
        <NavBar className={activeChat ? 'bg-black-100' : undefined} />
        <div className={`flex-1 overflow-y-auto px-4 [scrollbar-width:none] sm:px-6 md:px-8 [&::-webkit-scrollbar]:hidden ${activeChat ? 'bg-black-100' : ''}`}>
          {props.children}
        </div>
      </div>
    </div>
  );
};
