'use client';

import { useState } from 'react';
import { AuthButton } from '@/components/auth/AuthButton';
import { InputField } from '@/components/auth/InputField';
import { KeyIcon } from '@/components/icons';
import { supabase } from '@/libs/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email);
    console.warn('[Supabase resetPasswordForEmail] error:', supabaseError);

    if (supabaseError) {
      setError(supabaseError.message);
      setIsLoading(false);
      return;
    }

    setSuccess('Check your email for a reset link.');
    setIsLoading(false);
  };

  return (
    <div className="flex animate-[fadeIn_0.5s_ease-in-out] flex-col items-center justify-center space-y-6">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-fit rounded-[10px] bg-black-40 p-2.5">
          <KeyIcon />
        </div>
        <p className="mt-2.5 text-lg font-semibold text-white">Forgot your password?</p>
        <p className="mt-3 text-sm font-medium text-white">A link will be sent to your email to reset your password</p>
      </div>
      <InputField id="email" label="Email" placeholder="Enter Your Email" value={email} onChange={setEmail} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-green-400">{success}</p>}
      <AuthButton text="Submit" isLoading={isLoading} onClick={handleSubmit} />
    </div>
  );
}
