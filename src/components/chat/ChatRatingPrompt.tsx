'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { CloseIcon, StarIcon } from '@/components/icons';
import { useChatNavigation } from '@/context/ChatContext';
import { useChatService } from '@/services/useChatService';

export const ChatRatingPrompt = (props: { onDone: () => void }) => {
  const t = useTranslations('ChatRatingPrompt');
  const { activeChat } = useChatNavigation();
  const { rateChat } = useChatService();
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const submit = (rating: number) => {
    if (!activeChat || submitting) {
      return;
    }
    setSubmitting(true);
    rateChat(activeChat.chatroomId, rating)
      .then(() => {
        toast.success(t('toast_thanks'));
        props.onDone();
      })
      .catch(() => toast.error(t('toast_failed')))
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="mx-auto mb-1.75 flex w-full max-w-xl items-center justify-between rounded-xl border border-black-40 bg-black-80 px-4 py-3 shadow-lg">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-white">{t('question')}</span>
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
