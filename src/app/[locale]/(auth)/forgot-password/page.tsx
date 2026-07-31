'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthLink } from '@/components/auth/AuthLink';
import { InputField } from '@/components/auth/InputField';
import { KeyIcon } from '@/components/icons';
import { supabase } from '@/libs/supabase';

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPasswordPage');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/new-password`,
    });

    if (supabaseError) {
      setError(supabaseError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(t('check_email'));
    setIsLoading(false);
  };

  return (
    <div className="flex animate-[fadeIn_0.5s_ease-in-out] flex-col items-center justify-center space-y-6">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-fit rounded-[10px] bg-black-40 p-2.5">
          <KeyIcon />
        </div>
        <p className="mt-2.5 text-lg font-semibold text-white">{t('title')}</p>
        <p className="mt-3 text-sm font-medium text-white">{t('subtitle')}</p>
      </div>
      <InputField id="email" label={t('email_label')} placeholder={t('email_placeholder')} value={email} onChange={setEmail} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-green-400">{success}</p>}
      <div className="w-full">
        <AuthButton text={t('submit')} isLoading={isLoading} onClick={handleSubmit} />
        <AuthLink text={t('remember_password')} linkText={t('sign_in_link')} href="/sign-in" />
      </div>
    </div>
  );
}
