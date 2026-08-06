'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthLink } from '@/components/auth/AuthLink';
import { Divider } from '@/components/auth/Divider';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { InputField } from '@/components/auth/InputField';
import { AuthTitle } from '@/components/auth/Title';
import { guestToken } from '@/libs/guestToken';
import { supabase } from '@/libs/supabase';
import { createAuthService } from '@/services/useAuthService';

export default function SignUpPage() {
  const t = useTranslations('SignUpPage');
  const router = useRouter();
  const { register } = createAuthService();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

    const { data, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (supabaseError || !data.user) {
      setError(supabaseError?.message ?? t('sign_up_failed'));
      setIsLoading(false);
      return;
    }

    if (!data.session) {
      setSuccess(t('check_email'));
      setIsLoading(false);
      return;
    }

    const savedGuestToken = guestToken.get();
    await register({ id: data.user.id, email: data.user.email, token: data.session.access_token, guestToken: savedGuestToken ?? undefined });
    if (savedGuestToken) {
      guestToken.clear();
    }
    setIsLoading(false);
    router.push('/sign-in');
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-in-out] space-y-6 sm:space-y-7 md:space-y-8">
      <AuthTitle text={t('title')} />
      <GoogleButton text={t('google_button')} redirectPath="/auth/google-register" />
      <Divider text={t('divider')} />
      <InputField id="email" label={t('email_label')} placeholder={t('email_placeholder')} value={email} onChange={setEmail} />
      <InputField id="password" label={t('password_label')} isPassword value={password} onChange={setPassword} />
      <InputField id="confirm-password" label={t('confirm_password_label')} isPassword value={confirmPassword} onChange={setConfirmPassword} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-primary-100">{success}</p>}
      <div>
        <AuthButton text={t('submit')} isLoading={isLoading} onClick={handleSubmit} />
        <AuthLink text={t('have_account')} linkText={t('sign_in_link')} href="/sign-in" />
      </div>
    </div>
  );
}
