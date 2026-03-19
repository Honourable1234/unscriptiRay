'use client';

import { useState } from 'react';
import { SpinnerIcon } from '@/components/icons';

export const AuthButton = (props: { text: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <button
      type="submit"
      disabled={isLoading}
      onClick={handleClick}
      className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-primary-100 px-2.5 py-3 text-xs font-semibold text-white hover:bg-primary-200 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
    >
      {isLoading ? <SpinnerIcon /> : props.text}
    </button>
  );
};
