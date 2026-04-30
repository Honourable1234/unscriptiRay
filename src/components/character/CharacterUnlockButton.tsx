'use client';

import type { Character } from '@/data/characters';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { LockIcon2 } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';

export const CharacterUnlockButton = (props: { character: Character; onUnlocked: () => void }) => {
  const t = useTranslations('CharacterUnlockButton');
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setIsLoading(true);
    setError(null);
    api.post(`/characters/${props.character.id}/purchase-collection`, {}, token ?? undefined)
      .then((res) => {
        if (res?.success) {
          props.onUnlocked();
        } else {
          setError(res?.message ?? t('purchase_failed'));
        }
      })
      .catch(() => setError(t('error')))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="m-auto mb-6 flex flex-col items-center gap-2">
      <button
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-premium-100 to-primary-200 p-3 text-xs font-semibold text-white md:p-4 md:text-sm"
        onClick={handleClick}
        disabled={isLoading}
      >
        <LockIcon2 />
        {isLoading ? <BouncingDots /> : t('unlock', { name: props.character.name })}
      </button>
      {error && <p className="text-xs text-error-200">{error}</p>}
    </div>
  );
};
