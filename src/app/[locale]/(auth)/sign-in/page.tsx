'use client';

import { useState } from 'react';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthLink } from '@/components/auth/AuthLink';
import { Divider } from '@/components/auth/Divider';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { InputField } from '@/components/auth/InputField';
import { AuthTitle } from '@/components/auth/Title';
import { BouncingDots } from '@/components/general/BouncingDots';
import { Link } from '@/libs/I18nNavigation';

export default function SignInPage() {
  const [forgotLoading, setForgotLoading] = useState(false);

  return (
    <div className="animate-[fadeIn_0.5s_ease-in-out] space-y-6 sm:space-y-7 md:space-y-8">
      <AuthTitle text="Sign in" />
      <GoogleButton text="Log in" />
      <Divider text="Continue with email" />
      <InputField id="email" label="Email" placeholder="Enter Your Email" />
      <InputField id="password" label="Password" isPassword />
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
        <AuthButton text="Log In" />
        <AuthLink text="No account?" linkText="Sign Up" href="/sign-up" />
      </div>
    </div>
  );
}
