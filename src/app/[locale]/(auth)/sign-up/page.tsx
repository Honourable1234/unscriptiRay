import { AuthButton } from '@/components/auth/AuthButton';
import { AuthLink } from '@/components/auth/AuthLink';
import { Divider } from '@/components/auth/Divider';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { InputField } from '@/components/auth/InputField';
import { AuthTitle } from '@/components/auth/Title';

export default function SignUpPage() {
  return (
    <div className="animate-[fadeIn_0.5s_ease-in-out] space-y-6 sm:space-y-7 md:space-y-8">
      <AuthTitle text="Create your account" />
      <GoogleButton text="Sign up" />
      <Divider text="Continue with email" />
      <InputField id="email" label="Email" placeholder="Enter Your Email" />
      <InputField id="password" label="Password" isPassword />
      <InputField id="password" label="Confirm Password" isPassword />
      <div>
        <AuthButton text="Sign Up" />
        <AuthLink text="Have an account?" linkText="Sign In" href="/sign-in" />
      </div>
    </div>
  );
}
