import type { LocalePrefixMode } from 'next-intl/routing';

/** Locale prefix strategy for next-intl routing. */
const localePrefix: LocalePrefixMode = 'as-needed';

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
