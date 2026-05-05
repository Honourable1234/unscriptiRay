'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { GoogleIcon, SpinnerIcon } from '@/components/icons';
import { supabase } from '@/libs/supabase';

export const GoogleButton = (props: { text: string; redirectPath?: string }) => {
  const t = useTranslations('GoogleButton');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${props.redirectPath ?? '/'}` },
    });
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
              {t('with_google')}
            </>
          )}
    </button>
  );
};
