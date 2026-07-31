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
import { Link } from '@/libs/I18nNavigation';
import { returnUrl } from '@/libs/returnUrl';
import { supabase } from '@/libs/supabase';
import { createAuthService } from '@/services/useAuthService';

export default function SignInPage() {
  const t = useTranslations('SignInPage');
  const router = useRouter();
  const { claimGuest } = createAuthService();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({ email, password });

    if (supabaseError || !data.session) {
      setError(supabaseError?.message ?? t('login_failed'));
      setIsLoading(false);
      return;
    }

    const savedGuestToken = guestToken.get();
    if (savedGuestToken) {
      await claimGuest(savedGuestToken, data.session.access_token).catch(() => {});
      guestToken.clear();
    }

    setIsLoading(false);
    router.push(returnUrl.consume() ?? '/');
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-in-out] space-y-6 sm:space-y-7 md:space-y-8">
      <AuthTitle text={t('title')} />
      <GoogleButton text={t('google_button')} />
      <Divider text={t('divider')} />
      <InputField id="email" label={t('email_label')} placeholder={t('email_placeholder')} value={email} onChange={setEmail} />
      <InputField id="password" label={t('password_label')} isPassword value={password} onChange={setPassword} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-right">
        <Link href="/forgot-password" className="text-xs font-medium text-white">
          {t('forgot_password')}
        </Link>
      </p>
      <div>
        <AuthButton text={t('submit')} isLoading={isLoading} onClick={handleSubmit} />
        <AuthLink text={t('no_account')} linkText={t('sign_up_link')} href="/sign-up" />
      </div>
    </div>
  );
}
