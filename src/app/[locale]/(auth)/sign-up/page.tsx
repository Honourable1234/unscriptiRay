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
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    const { data, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (supabaseError || !data.user) {
      setError(supabaseError?.message ?? 'Sign up failed');
      setIsLoading(false);
      return;
    }

    if (!data.session) {
      setSuccess('Check your email to confirm your account.');
      setIsLoading(false);
      return;
    }

    await api.post(
      '/auth/register',
      { id: data.user.id, email: data.user.email, password: '' },
      data.session.access_token,
    );
    setIsLoading(false);
    router.push('/sign-in');
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-in-out] space-y-6 sm:space-y-7 md:space-y-8">
      <AuthTitle text="Create your account" />
      <GoogleButton text="Sign up" redirectPath="/auth/google-register" />
      <Divider text="Continue with email" />
      <InputField id="email" label="Email" placeholder="Enter Your Email" value={email} onChange={setEmail} />
      <InputField id="password" label="Password" isPassword value={password} onChange={setPassword} />
      <InputField id="confirm-password" label="Confirm Password" isPassword value={confirmPassword} onChange={setConfirmPassword} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-primary-100">{success}</p>}
      <div>
        <AuthButton text="Sign Up" isLoading={isLoading} onClick={handleSubmit} />
        <AuthLink text="Have an account?" linkText="Sign In" href="/sign-in" />
      </div>
    </div>
  );
}
