'use client';

import { CloseIcon } from '@/components/icons';
import { Link } from '@/libs/I18nNavigation';
import { returnUrl } from '@/libs/returnUrl';

export const CreateSignUpPrompt = (props: { onClose: () => void }) => {
  const saveReturnUrl = () => returnUrl.save(window.location.pathname);

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
        className="relative w-full max-w-100 rounded-2xl border border-white-25 bg-black-80 px-6 py-6"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-black-40 pb-4">
          <h2 className="text-base font-semibold text-white">Sign up to continue</h2>
          <button onClick={props.onClose} className="cursor-pointer text-white-75 hover:text-white">
            <CloseIcon />
          </button>
        </div>

        <p className="mb-5 text-sm text-white-75">Sign up to bring your companion to life — your creation will be saved to your account.</p>

        <div className="mt-5 flex flex-col gap-2.5">
          <Link
            href="/sign-up"
            onClick={saveReturnUrl}
            className="cursor-pointer rounded-xl bg-primary-100 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Sign up free
          </Link>
          <Link
            href="/sign-in"
            onClick={saveReturnUrl}
            className="cursor-pointer rounded-xl border border-black-40 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-primary-100 hover:text-primary-100"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};
