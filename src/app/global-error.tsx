'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

const errorMessages: Record<string, { title: string; retry: string }> = {
  en: { title: 'Something went wrong', retry: 'Try again' },
  fr: { title: 'Une erreur est survenue', retry: 'Réessayer' },
};

export default function GlobalError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(props.error);
  }, [props.error]);

  const pathLocale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1]
    : 'en';
  const locale = pathLocale !== undefined && pathLocale in errorMessages ? pathLocale : 'en';
  const msg = errorMessages[locale]!;

  return (
    <html lang={locale}>
      <body>
        <main style={{ textAlign: 'center', padding: '4rem' }}>
          <h1 style={{ color: 'white', marginBottom: '1rem' }}>{msg.title}</h1>
          <button
            type="button"
            onClick={props.reset}
            style={{ padding: '0.5rem 1.5rem', cursor: 'pointer' }}
          >
            {msg.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
