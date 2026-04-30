'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { OpenIcon, TrashIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useChatMessages, useChatNavigation } from '@/context/ChatContext';
import { api } from '@/libs/api';
import { ChatInputBar } from './ChatInputBar';
import { ChatMessageList } from './ChatMessageList';
import { ChatRatingPrompt } from './ChatRatingPrompt';
import { ChatRightPanel } from './ChatRightPanel';

export const ChatRoom = () => {
  const t = useTranslations('ChatRoom');
  const { activeChat } = useChatNavigation();
  const { messages, setMessages } = useChatMessages();
  const { token } = useAuth();
  const [rightOpen, setRightOpen] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [lastRatedAtCount, setLastRatedAtCount] = useState(0);

  const seenCharacterIds = useRef(new Set<number>());
  const [characterResponseCount, setCharacterResponseCount] = useState(0);

  useEffect(() => {
    if (messages.length === 0) {
      seenCharacterIds.current.clear();
      setCharacterResponseCount(0);
      return;
    }
    let added = 0;
    for (const m of messages) {
      if (m.sender === 'character' && !seenCharacterIds.current.has(m.id as number)) {
        seenCharacterIds.current.add(m.id as number);
        added++;
      }
    }
    if (added > 0) {
      setCharacterResponseCount(prev => prev + added);
    }
  }, [messages]);

  const ratingCycle = Math.floor(characterResponseCount / 10);
  const lastRatedCycle = Math.floor(lastRatedAtCount / 10);
  const showRatingPrompt = characterResponseCount > 0 && ratingCycle > lastRatedCycle;

  const displayMessages = messages.length === 0 && activeChat?.greetingMessage
    ? [{ id: 0, text: activeChat.greetingMessage, sender: 'character' as const, time: '', date: 'Today' }]
    : messages;

  const handleClearConfirm = () => {
    if (!activeChat) {
      return;
    }
    api.delete(`/chat/${activeChat.chatroomId}/messages`, token ?? undefined)
      .then(() => {
        setMessages([]);
        setShowClearConfirm(false);
      })
      .catch(() => {
        setShowClearConfirm(false);
      });
  };

  if (!activeChat) {
    return null;
  }

  return (
    <div className="relative flex h-full">
      <div className="flex flex-1 flex-col">
        {/* Chat header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-black-40 px-4 py-3">
          <span className="font-semibold text-white">{activeChat.name}</span>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="cursor-pointer text-white-50 hover:text-white"
          >
            <TrashIcon />
          </button>
        </div>

        {/* Clear confirmation */}
        {showClearConfirm && (
          <div className="flex flex-shrink-0 items-center justify-between border-b border-black-40 bg-black-80 px-4 py-3">
            <span className="text-sm text-white">{t('clear_confirm')}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="cursor-pointer rounded-lg border border-black-40 px-3 py-1.5 text-xs text-white-75 hover:text-white"
              >
                {t('cancel')}
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
          backgroundImage={activeChat.image}
        />

        {showRatingPrompt && (
          <ChatRatingPrompt onDone={() => setLastRatedAtCount(characterResponseCount)} />
        )}

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
