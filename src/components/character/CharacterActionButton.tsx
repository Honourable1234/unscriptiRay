'use client';

import { useState } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';

export const CharacterActionButton = (props: {
  text: string;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
    props.onClick?.();
  };

  return (
    <button
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold whitespace-nowrap text-white ${props.className ?? ''}`}
      onClick={handleClick}
      disabled={isLoading}
    >
      {props.icon}
      {isLoading ? <BouncingDots /> : props.text}
    </button>
  );
};
