'use client';

import { useTranslations } from 'next-intl';

export const GenerateEmptyState = () => {
  const t = useTranslations('GenerateEmptyState');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-medium text-white">{t('no_characters')}</p>
      <p className="mt-1 text-sm text-white-75">{t('create_now')}</p>
    </div>
  );
};
