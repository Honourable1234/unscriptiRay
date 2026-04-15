'use client';

import type { Character } from '@/data/characters';
import { useState } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { LockIcon2 } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';

export const CharacterUnlockButton = (props: { character: Character; onUnlocked: () => void }) => {
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
          setError(res?.message ?? 'Purchase failed');
        }
      })
      .catch(() => setError('Something went wrong'))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="m-auto mb-6 flex flex-col items-center gap-2">
      <button
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-error-100 to-primary-200 p-3 text-xs font-semibold text-white md:p-4 md:text-sm"
        onClick={handleClick}
        disabled={isLoading}
      >
        <LockIcon2 />
        {isLoading ? <BouncingDots /> : `Unlock ${props.character.name} — 50 coins`}
      </button>
      {error && <p className="text-xs text-error-100">{error}</p>}
    </div>
  );
};
