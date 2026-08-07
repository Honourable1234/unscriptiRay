import type { LocalePrefixMode } from 'next-intl/routing';

/** Locale prefix strategy for next-intl routing: the locale is never shown in the URL. */
const localePrefix: LocalePrefixMode = 'never';

export const AppConfig = {
  name: 'Unscripti',
  i18n: {
    locales: [
      'en',
      'de-DE',
      'es-ES',
      'fr-FR',
      'it-IT',
      'ja-JP',
      'ko-KR',
      'pt-BR',
      'ru-RU',
      'zh-CN',
      'zh-TW',
    ],
    defaultLocale: 'en',
    localePrefix,
  },
};
