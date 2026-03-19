'use client';

import { useState } from 'react';
import { GoogleIcon, SpinnerIcon } from '@/components/icons';

export const GoogleButton = (props: { text: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleClick}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-black-40 px-2.5 py-3 text-sm font-semibold text-white hover:bg-black-80 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
    >
      {isLoading
        ? <SpinnerIcon />
        : (
            <>
              <GoogleIcon />
              {props.text}
              {' '}
              with Google
            </>
          )}
    </button>
  );
};
