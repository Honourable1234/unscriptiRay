'use client';

import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '@/components/icons';

export const InputField = (props: {
  label: string;
  id: string;
  isPassword?: boolean;
  placeholder?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const type = props.isPassword
    ? showPassword ? 'text' : 'password'
    : 'text';

  return (
    <div className="flex w-full flex-col gap-1">
      <label className="text-sm font-medium text-white" htmlFor={props.id}>
        {props.label}
      </label>
      <div className="relative">
        <input
          id={props.id}
          type={type}
          placeholder={!props.isPassword ? props.placeholder : undefined}
          className="mt-1 h-14 w-full rounded-xl border border-white-25 bg-black-60 px-3 py-2 text-sm text-white placeholder:text-white sm:mt-2 md:mt-3 md:px-4 md:py-3"
        />
        {props.isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute top-8 right-3 -translate-y-1/2 text-white/60 hover:text-white sm:top-9 md:top-10"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </div>
  );
};
