'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthLink } from '@/components/auth/AuthLink';
import { Divider } from '@/components/auth/Divider';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { InputField } from '@/components/auth/InputField';
import { AuthTitle } from '@/components/auth/Title';
import { BouncingDots } from '@/components/general/BouncingDots';

import { Link } from '@/libs/I18nNavigation';
import { supabase } from '@/libs/supabase';

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({ email, password });

    if (supabaseError || !data.session) {
      setError(supabaseError?.message ?? 'Login failed');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    router.push('/');
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-in-out] space-y-6 sm:space-y-7 md:space-y-8">
      <AuthTitle text="Sign in" />
      <GoogleButton text="Log in" />
      <Divider text="Continue with email" />
      <InputField id="email" label="Email" placeholder="Enter Your Email" value={email} onChange={setEmail} />
      <InputField id="password" label="Password" isPassword value={password} onChange={setPassword} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-right">
        <Link
          href="/forgot-password"
          onClick={() => setForgotLoading(true)}
          className={`inline-flex items-center text-xs font-medium text-white ${forgotLoading ? 'pointer-events-none' : ''}`}
        >
          {forgotLoading ? <BouncingDots /> : 'Forgot password?'}
        </Link>
      </p>
      <div>
        <AuthButton text="Log In" isLoading={isLoading} onClick={handleSubmit} />
        <AuthLink text="No account?" linkText="Sign Up" href="/sign-up" />
      </div>
    </div>
  );
}
