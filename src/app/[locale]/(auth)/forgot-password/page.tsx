import { AuthButton } from '@/components/auth/AuthButton';
import { InputField } from '@/components/auth/InputField';
import { KeyIcon } from '@/components/icons';

export default function ForgotPasswordPage() {
  return (
    <div className="flex animate-[fadeIn_0.5s_ease-in-out] flex-col items-center justify-center space-y-6">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-fit rounded-[10px] bg-black-40 p-2.5">
          <KeyIcon />
        </div>
        <p className="mt-2.5 text-lg font-semibold text-white">Forgot your password?</p>
        <p className="mt-3 text-sm font-medium text-white">A code will be sent to your email to help reset password</p>
      </div>
      <InputField id="email" label="Email" placeholder="Enter Your Email" />
      <AuthButton text="Submit" />
    </div>
  );
}
