'use client';

import type { Character } from '@/data/characters';
import { useState } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { LockIcon2 } from '@/components/icons';

export const CharacterUnlockButton = (props: { character: Character }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <button
      className="m-auto mb-6 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-error-100 to-primary-200 p-3 text-xs font-semibold text-white md:p-4 md:text-sm"
      onClick={handleClick}
      disabled={isLoading}
    >
      <LockIcon2 />
      {isLoading ? <BouncingDots /> : `Unlock ${props.character.name}`}
    </button>
  );
};
