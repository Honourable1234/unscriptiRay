'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthLink } from '@/components/auth/AuthLink';
import { Divider } from '@/components/auth/Divider';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { InputField } from '@/components/auth/InputField';
import { AuthTitle } from '@/components/auth/Title';
import { api } from '@/libs/api';
import { supabase } from '@/libs/supabase';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    const { data, error: supabaseError } = await supabase.auth.signUp({ email, password });
    console.warn('[Supabase signUp] data:', data, 'error:', supabaseError);

    if (supabaseError || !data.user) {
      setError(supabaseError?.message ?? 'Sign up failed');
      setIsLoading(false);
      return;
    }

    const res = await api.post('/auth/register', { email, password });
    console.warn('[Backend /auth/register] response:', res);

    setIsLoading(false);
    router.push('/sign-in');
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-in-out] space-y-6 sm:space-y-7 md:space-y-8">
      <AuthTitle text="Create your account" />
      <GoogleButton text="Sign up" />
      <Divider text="Continue with email" />
      <InputField id="email" label="Email" placeholder="Enter Your Email" value={email} onChange={setEmail} />
      <InputField id="password" label="Password" isPassword value={password} onChange={setPassword} />
      <InputField id="confirm-password" label="Confirm Password" isPassword value={confirmPassword} onChange={setConfirmPassword} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div>
        <AuthButton text="Sign Up" isLoading={isLoading} onClick={handleSubmit} />
        <AuthLink text="Have an account?" linkText="Sign In" href="/sign-in" />
      </div>
    </div>
  );
}
