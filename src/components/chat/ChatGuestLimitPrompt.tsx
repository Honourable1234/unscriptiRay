'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/libs/I18nNavigation';

export const ChatGuestLimitPrompt = () => {
  const t = useTranslations('ChatGuestLimitPrompt');

  return (
    <div className="mx-auto mb-3 w-full max-w-3xl rounded-3xl border border-black-40 bg-black-60 px-5 py-4 text-center">
      <p className="text-sm font-semibold text-white">{t('title')}</p>
      <p className="mt-1 text-xs text-white-75">{t('description')}</p>
      <div className="mt-3 flex items-center justify-center gap-2">
        <Link
          href="/sign-up"
          className="cursor-pointer rounded-full bg-primary-100 px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80"
        >
          {t('sign_up_free')}
        </Link>
        <Link
          href="/sign-in"
          className="cursor-pointer rounded-full border border-white-25 px-5 py-2 text-xs font-semibold text-white transition-colors hover:border-primary-100 hover:text-primary-100"
        >
          {t('log_in')}
        </Link>
      </div>
    </div>
  );
};
