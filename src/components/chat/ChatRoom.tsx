'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useChatMessages, useChatNavigation } from '@/context/ChatContext';
import { useChatService } from '@/services/useChatService';
import { ChatInputBar } from './ChatInputBar';
import { ChatMessageList } from './ChatMessageList';
import { ChatRatingPrompt } from './ChatRatingPrompt';
import { ChatRightPanel, ChatRightPanelToggle } from './ChatRightPanel';

export const ChatRoom = () => {
  const t = useTranslations('ChatRoom');
  const { activeChat, setActiveChat, bumpChatList } = useChatNavigation();
  const { messages, setMessages } = useChatMessages();
  const { clearMessages, deleteRoom, getSettings } = useChatService();
  const [showClearConfirmId, setShowClearConfirmId] = useState<string | null>(null);
  const [lastRatedCycles, setLastRatedCycles] = useState<Record<string, number>>({});
  const [backgroundDisplays, setBackgroundDisplays] = useState<Record<string, boolean>>({});

  const chatroomId = activeChat?.chatroomId;
  const showClearConfirm = showClearConfirmId === chatroomId;
  const lastRatedCycle = lastRatedCycles[chatroomId ?? ''] ?? 0;
  const backgroundDisplay = backgroundDisplays[chatroomId ?? ''] ?? true;

  useEffect(() => {
    if (!chatroomId) {
      return;
    }
    getSettings(chatroomId).then((res) => {
      const ws = res?.content?.web_settings;
      if (ws && typeof ws.background_display === 'boolean') {
        setBackgroundDisplays(prev => ({ ...prev, [chatroomId]: ws.background_display as boolean }));
      }
    }).catch(() => {});
  }, [chatroomId]);

  const characterResponseCount = messages.filter(m => m.sender === 'character').length;
  const ratingCycle = Math.floor(characterResponseCount / 10);
  const showRatingPrompt = characterResponseCount > 0 && ratingCycle > lastRatedCycle;

  const displayMessages = messages.length === 0 && activeChat?.greetingMessage
    ? [{ id: 0, text: activeChat.greetingMessage, sender: 'character' as const, time: '', date: 'Today' }]
    : messages;

  const handleClearConfirm = () => {
    if (!activeChat) {
      return;
    }
    clearMessages(activeChat.chatroomId)
      .then(() => {
        setMessages([]);
        setShowClearConfirmId(null);
        toast.success('Chat cleared.');
      })
      .catch(() => {
        setShowClearConfirmId(null);
        toast.error('Failed to clear chat.');
      });
  };

  const handleDeleteRoom = () => {
    if (!activeChat) {
      return;
    }
    deleteRoom(activeChat.chatroomId)
      .then(() => {
        toast.success('Chat room deleted.');
        setShowClearConfirmId(null);
        setActiveChat(null);
        bumpChatList();
      })
      .catch(() => {
        setShowClearConfirmId(null);
        toast.error('Failed to delete chat room.');
      });
  };

  if (!activeChat) {
    return null;
  }

  return (
    <SidebarProvider
      className="h-full min-h-0 w-full transform-[translateZ(0)]"
      style={{ '--sidebar-width': '20rem' } as React.CSSProperties}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Chat header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-black-40 px-4 py-3">
          <span className="font-semibold text-white">{activeChat.name}</span>
          {/* <div className="flex items-center gap-3">
            <button
              onClick={() => setShowClearConfirmId(activeChat.chatroomId)}
              className="cursor-pointer text-white-50 hover:text-white"
            >
              <TrashIcon />
            </button> */}
          <ChatRightPanelToggle />
          {/* </div> */}
        </div>

        {/* Clear/delete confirmation */}
        {showClearConfirm && (
          <div className="flex flex-shrink-0 items-center justify-between border-b border-black-40 bg-black-80 px-4 py-3">
            <span className="text-sm text-white">{t('clear_confirm')}</span>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteRoom}
                className="cursor-pointer rounded-lg bg-red-700/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Delete Chat Room
              </button>
              <button
                onClick={handleClearConfirm}
                className="cursor-pointer rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
              >
                {t('clear')}
              </button>
            </div>
          </div>
        )}

        <ChatMessageList
          messages={displayMessages}
          characterName={activeChat.name}
          characterImage={activeChat.image}
          backgroundImage={backgroundDisplay ? activeChat.image : undefined}
        />

        {showRatingPrompt && (
          <ChatRatingPrompt onDone={() => setLastRatedCycles(prev => ({ ...prev, [chatroomId!]: ratingCycle }))} />
        )}

        <ChatInputBar key={activeChat.chatroomId} />
      </div>

      <ChatRightPanel
        key={activeChat.characterId}
        name={activeChat.name}
        image={activeChat.image}
        onBackgroundDisplayChange={(v) => {
          if (chatroomId) {
            setBackgroundDisplays(prev => ({ ...prev, [chatroomId]: v }));
          }
        }}
      />
    </SidebarProvider>
  );
};
