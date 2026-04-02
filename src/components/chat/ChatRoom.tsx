'use client';

import { useState } from 'react';
import { OpenIcon } from '@/components/icons';
import { useChat } from '@/context/ChatContext';
import { ChatInputBar } from './ChatInputBar';
import { ChatMessageList } from './ChatMessageList';
import { ChatRightPanel } from './ChatRightPanel';
import { mockMessages } from './mockData';

export const ChatRoom = () => {
  const { activeChat } = useChat();
  const [rightOpen, setRightOpen] = useState(true);

  if (!activeChat) {
    return null;
  }

  return (
    <div className="relative flex h-full">
      <div className="flex flex-1 flex-col">
        <ChatMessageList
          messages={mockMessages}
          characterName={activeChat.name}
          characterImage={activeChat.image}
          backgroundImage={activeChat.image}
        />
        <ChatInputBar />
      </div>

      {/* Right panel toggle button (when closed) */}
      {!rightOpen && (
        <button
          onClick={() => setRightOpen(true)}
          className="fixed top-20 right-4 z-50 cursor-pointer rounded-lg bg-black-100/40 p-2 text-white/40 hover:text-white-75"
        >
          <OpenIcon />
        </button>
      )}

      {/* Right panel — overlays on lg and below, inline above */}
      {rightOpen && (
        <div className="absolute inset-y-0 right-0 z-30 w-full max-w-80 lg:relative lg:inset-auto lg:z-auto">
          <ChatRightPanel
            name={activeChat.name}
            image={activeChat.image}
            onClose={() => setRightOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
