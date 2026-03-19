import { AuthButton } from '@/components/auth/AuthButton';
import { InputField } from '@/components/auth/InputField';
import { PadlockIcon } from '@/components/icons';

export default function NewPasswordPage() {
  return (
    <div className="flex animate-[fadeIn_0.5s_ease-in-out] flex-col items-center justify-center space-y-6">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-fit rounded-[10px] bg-black-40 p-2.5">
          <PadlockIcon />
        </div>
        <p className="mt-2.5 text-lg font-semibold text-white">New Password</p>
        <p className="mt-3 text-sm font-medium text-white">Please enter your new password</p>
      </div>
      <InputField id="password" label="New Password" isPassword />
      <InputField id="password" label="Confirm Password" isPassword />
      <AuthButton text="Submit" />
    </div>
  );
}
