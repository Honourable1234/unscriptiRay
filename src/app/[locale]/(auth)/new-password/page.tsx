'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthButton } from '@/components/auth/AuthButton';
import { InputField } from '@/components/auth/InputField';
import { PadlockIcon } from '@/components/icons';
import { supabase } from '@/libs/supabase';

export default function NewPasswordPage() {
  const t = useTranslations('NewPasswordPage');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwords_mismatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('password_too_short'));
      return;
    }

    setIsLoading(true);

    const { error: supabaseError } = await supabase.auth.updateUser({ password });

    if (supabaseError) {
      setError(supabaseError.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    router.push('/sign-in');
  };

  return (
    <div className="flex animate-[fadeIn_0.5s_ease-in-out] flex-col items-center justify-center space-y-6">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-fit rounded-[10px] bg-black-40 p-2.5">
          <PadlockIcon />
        </div>
        <p className="mt-2.5 text-lg font-semibold text-white">{t('title')}</p>
        <p className="mt-3 text-sm font-medium text-white">{t('subtitle')}</p>
      </div>
      <InputField id="password" label={t('new_password_label')} isPassword value={password} onChange={setPassword} />
      <InputField id="confirm-password" label={t('confirm_password_label')} isPassword value={confirmPassword} onChange={setConfirmPassword} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <AuthButton text={t('submit')} isLoading={isLoading} onClick={handleSubmit} />
    </div>
  );
}
