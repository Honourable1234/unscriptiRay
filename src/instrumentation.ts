import * as Sentry from '@sentry/nextjs';
import { Env } from '@/libs/Env';

const sentryOptions: Sentry.NodeOptions | Sentry.EdgeOptions = {
  dsn: Env.NEXT_PUBLIC_SENTRY_DSN,

  // Enable Spotlight in development
  spotlight: process.env.NODE_ENV === 'development',

  sendDefaultPii: false,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  enableLogs: false,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
};

export async function register() {
  if (Env.NEXT_PUBLIC_SENTRY_DISABLED !== 'true') {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      // Node.js Sentry configuration
      Sentry.init(sentryOptions);
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      // Edge Sentry configuration
      Sentry.init(sentryOptions);
    }
  }
}

export const onRequestError = Sentry.captureRequestError;
