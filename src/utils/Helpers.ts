import { Env } from '@/libs/Env';
import { routing } from '@/libs/I18nRouting';

/**
 * Resolves the public base URL of the application.
 */
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  if (Env.NEXT_PUBLIC_APP_URL) {
    return Env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_APP_URL must be set in production. Add it to your environment variables.',
    );
  }

  return 'http://localhost:3000';
};

/**
 * Builds a locale-aware path by prefixing non-default locales.
 * @param url - The base application-relative path starting with a slash.
 * @param locale - The active locale identifier.
 */
export const getI18nPath = (url: string, locale: string) => {
  if (locale === routing.defaultLocale) {
    return url;
  }

  return `/${locale}${url}`;
};

/**
 * Formats a signed coin movement for a transaction table.
 * @param amount - Coins added (positive) or spent (negative).
 * @returns The amount with an explicit sign.
 */
export const signedAmount = (amount: number) => (amount > 0 ? `+${amount}` : `${amount}`);

/**
 * Builds the page buttons to show, keeping the first, last and neighbouring
 * pages and collapsing the rest into gaps.
 * @param page - Page currently on screen.
 * @param pageCount - Total number of pages.
 * @returns Page numbers in order, with null marking a collapsed gap.
 */
export const pagesToShow = (page: number, pageCount: number) => {
  const shown = Array.from({ length: pageCount }, (_, i) => i + 1)
    .filter(p => p === 1 || p === pageCount || Math.abs(p - page) <= 1);
  return shown.flatMap<number | null>((p, i) => {
    const previous = shown[i - 1];
    return previous && p - previous > 1 ? [null, p] : [p];
  });
};
