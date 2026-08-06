'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { AiIcon, SendIcon, SpinnerIcon } from '@/components/icons';
import { useChatNavigation } from '@/context/ChatContext';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { useChatService } from '@/services/useChatService';

const MAX_INPUT_HEIGHT = 160;

export const ChatInputBar = () => {
  const t = useTranslations('ChatInputBar');
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { activeChat } = useChatNavigation();
  const { send } = useChatWebSocket();
  const { getSuggestions } = useChatService();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !activeChat) {
      return;
    }
    setInput('');
    setSuggestions([]);
    resetTextareaHeight();
    await send(text);
  };

  const fetchSuggestions = async () => {
    if (!activeChat || loadingSuggestions) {
      return;
    }
    setLoadingSuggestions(true);
    try {
      const res = await getSuggestions(activeChat.chatroomId);
      const items = res?.content?.suggestions ?? res?.content?.items ?? res?.content;
      if (Array.isArray(items)) {
        setSuggestions(items as string[]);
      }
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (suggestions.length > 0) {
      setSuggestions([]);
    }
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col ">
      {/* Suggestion chips */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => {
                setInput(s);
                setSuggestions([]);
                resetTextareaHeight();
              }}
              className="cursor-pointer rounded-full border border-black-40 bg-black-60 px-3 py-1.5 text-xs text-white hover:border-primary-100 hover:text-primary-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="pt-3 pb-1 sm:px-4">
        <div className="rounded-3xl border border-black-40 bg-black-60 px-4 pt-4 pb-3 sm:px-5">
          <div className="flex items-start gap-2">
            {loadingSuggestions
              ? (
                  <div className="flex flex-1 items-center gap-2 text-sm text-white-75">
                    <span className="text-premium-100">
                      <SpinnerIcon />
                    </span>
                    {t('generating_suggestion')}
                  </div>
                )
              : (
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={t('placeholder')}
                    rows={1}
                    className="max-h-40 flex-1 resize-none overflow-y-auto bg-transparent text-sm text-white placeholder-white-75 [scrollbar-width:none] focus:outline-none [&::-webkit-scrollbar]:hidden"
                  />
                )}
          </div>

          <div className="mt-3 flex items-center justify-end gap-3">
            <button
              onClick={() => void fetchSuggestions()}
              className="cursor-pointer text-white-75 hover:text-white [&>svg]:size-4"
            >
              <AiIcon />
            </button>
            <button
              onClick={() => void sendMessage()}
              aria-label={t('send_message')}
              className="flex cursor-pointer items-center justify-center rounded-full bg-white p-2.5 text-black-100 [&>svg]:size-4"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
