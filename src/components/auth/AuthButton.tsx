'use client';

import { SpinnerIcon } from '@/components/icons';

export const AuthButton = (props: {
  text: string;
  isLoading?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="submit"
    disabled={props.isLoading}
    onClick={props.onClick}
    className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-primary-100 px-2.5 py-3 text-xs font-semibold text-white hover:bg-primary-200 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
  >
    {props.isLoading ? <SpinnerIcon /> : props.text}
  </button>
);
