'use client';

import { Link } from '@/libs/I18nNavigation';

export const ChatGuestLimitPrompt = () => {
  return (
    <div className="mx-auto mb-3 w-full max-w-3xl rounded-3xl border border-black-40 bg-black-60 px-5 py-4 text-center">
      <p className="text-sm font-semibold text-white">You've reached the guest limit</p>
      <p className="mt-1 text-xs text-white-75">Sign up to keep chatting — your conversation will be saved to your account.</p>
      <div className="mt-3 flex items-center justify-center gap-2">
        <Link
          href="/sign-up"
          className="cursor-pointer rounded-full bg-primary-100 px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80"
        >
          Sign up free
        </Link>
        <Link
          href="/sign-in"
          className="cursor-pointer rounded-full border border-white-25 px-5 py-2 text-xs font-semibold text-white transition-colors hover:border-primary-100 hover:text-primary-100"
        >
          Log in
        </Link>
      </div>
    </div>
  );
};
