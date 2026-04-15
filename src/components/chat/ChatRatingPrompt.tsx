'use client';

import { useState } from 'react';
import { CloseIcon, StarIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { api } from '@/libs/api';

export const ChatRatingPrompt = (props: { onDone: () => void }) => {
  const { token } = useAuth();
  const { activeChat } = useChat();
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const submit = (rating: number) => {
    if (!activeChat || submitting) {
      return;
    }
    setSubmitting(true);
    api.post(`/chat/${activeChat.chatroomId}/rate`, { rating }, token ?? undefined)
      .finally(() => {
        setSubmitting(false);
        props.onDone();
      });
  };

  return (
    <div className="mx-4 mb-2 flex items-center justify-between rounded-xl border border-black-40 bg-black-80 px-4 py-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-white">How is the conversation going?</span>
        <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => submit(n)}
              onMouseEnter={() => setHovered(n)}
              disabled={submitting}
              className="cursor-pointer text-primary-100 transition-transform hover:scale-110 disabled:opacity-50"
            >
              <StarIcon filled={n <= hovered} />
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={props.onDone}
        className="cursor-pointer text-white-50 hover:text-white"
      >
        <CloseIcon />
      </button>
    </div>
  );
};
