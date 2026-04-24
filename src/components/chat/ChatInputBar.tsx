'use client';

import { useState } from 'react';
import { AiIcon, AttachIcon, MicIcon, SendIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { api } from '@/libs/api';

export const ChatInputBar = () => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { token } = useAuth();
  const { activeChat } = useChat();
  const { send } = useChatWebSocket();

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !activeChat) {
      return;
    }
    setInput('');
    setSuggestions([]);
    await send(text);
  };

  const fetchSuggestions = async () => {
    if (!activeChat || loadingSuggestions) {
      return;
    }
    setLoadingSuggestions(true);
    try {
      const res = await api.post(
        `/chat/${activeChat.chatroomId}/suggestions`,
        {},
        token ?? undefined,
      );
      const items = res?.content?.suggestions ?? res?.content?.items ?? res?.content;
      if (Array.isArray(items)) {
        setSuggestions(items as string[]);
      }
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (suggestions.length > 0) {
      setSuggestions([]);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Suggestion chips */}
      {(suggestions.length > 0 || loadingSuggestions) && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {loadingSuggestions
            ? (
                <span className="text-xs text-white-50">Getting suggestions…</span>
              )
            : suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    setSuggestions([]);
                  }}
                  className="cursor-pointer rounded-full border border-black-40 bg-black-60 px-3 py-1.5 text-xs text-white hover:border-primary-100 hover:text-primary-100"
                >
                  {s}
                </button>
              ))}
        </div>
      )}

      <div className="flex py-3 sm:px-4">
        <div className="flex w-full items-center gap-3 rounded-l-xl border border-black-40 bg-black-60 px-3 py-3 sm:px-4 sm:py-6">
          <button className="cursor-pointer text-white-75 hover:text-white">
            <AttachIcon />
          </button>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white-75 focus:outline-none"
          />
          <button
            onClick={input.trim() ? () => void sendMessage() : () => void fetchSuggestions()}
            className="cursor-pointer text-white-75 hover:text-white"
          >
            {input.trim() ? <SendIcon /> : <AiIcon />}
          </button>
        </div>
        <button className="cursor-pointer rounded-r-xl bg-primary-100 px-3 py-3 text-white sm:px-6 sm:py-4">
          <MicIcon />
        </button>
      </div>
    </div>
  );
};
