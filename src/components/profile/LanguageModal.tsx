'use client';

import { useTranslations } from 'next-intl';
import { CloseIcon } from '@/components/icons';
import { usePathname, useRouter } from '@/libs/I18nNavigation';
import { routing } from '@/libs/I18nRouting';
import { LOCALE_NAMES } from '@/utils/locales';

export const LanguageModal = (props: { current: string; onClose: () => void }) => {
  const t = useTranslations('LanguageModal');
  const router = useRouter();
  const pathname = usePathname();

  const handleSelect = (newLocale: string) => {
    if (newLocale === props.current) {
      props.onClose();
      return;
    }
    const { search } = window.location;
    router.push(`${pathname}${search}`, { locale: newLocale, scroll: false });
    props.onClose();
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={props.onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          props.onClose();
        }
      }}
    >
      <div
        role="presentation"
        className="relative max-h-[90vh] w-full max-w-105 overflow-y-auto rounded-2xl border border-white-25 bg-black-80 px-6 py-6"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between border-b border-black-40 pb-4">
          <h2 className="text-base font-semibold text-white">{t('title')}</h2>
          <button onClick={props.onClose} className="cursor-pointer text-white-75 hover:text-white">
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col divide-y divide-black-40">
          {routing.locales.map(locale => (
            <button
              key={locale}
              onClick={() => handleSelect(locale)}
              className="flex w-full cursor-pointer items-center justify-between px-1 py-3 text-left hover:bg-black-40"
            >
              <span className={`text-sm ${locale === props.current ? 'font-semibold text-primary-100' : 'text-white'}`}>
                {LOCALE_NAMES[locale] ?? locale}
              </span>
              {locale === props.current && <span className="text-xs font-semibold text-primary-100">{t('current')}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
