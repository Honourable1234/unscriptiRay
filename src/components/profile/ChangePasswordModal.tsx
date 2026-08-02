'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { InputField } from '@/components/auth/InputField';
import { CloseIcon, SpinnerIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/libs/supabase';

const MIN_LENGTH = 8;

export const ChangePasswordModal = (props: { onClose: () => void }) => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  // Null until the sign-in methods are known.
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  useEffect(() => {
    // An account created through Google has no password to replace, so the form
    // is swapped for an explanation instead of failing on submit.
    supabase.auth.getUser().then(({ data }) => {
      setHasPassword(data.user?.identities?.some(identity => identity.provider === 'email') ?? true);
    }).catch(() => setHasPassword(true));
  }, []);

  const canSubmit = !!currentPassword && !!newPassword && !!confirmPassword && !saving;

  const handleSubmit = async () => {
    setError('');

    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }
    if (newPassword.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (newPassword === currentPassword) {
      setError('The new password is the same as the current one.');
      return;
    }
    if (!user?.email) {
      setError('This account has no email address to verify against.');
      return;
    }

    setSaving(true);

    // Supabase lets any live session set a new password without proving the old
    // one, so the current password is verified first.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      setError('That current password is not correct.');
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    toast.success('Password changed');
    props.onClose();
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={() => !saving && props.onClose()}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !saving) {
          props.onClose();
        }
      }}
    >
      <div
        role="presentation"
        className="relative max-h-[90vh] w-full max-w-105 overflow-y-auto rounded-2xl border border-white-25 bg-black-80 px-6 py-6"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between border-b border-black-40 pb-4">
          <h2 className="text-base font-semibold text-white">Change password</h2>
          <button onClick={props.onClose} disabled={saving} className="cursor-pointer text-white-75 hover:text-white disabled:opacity-50">
            <CloseIcon />
          </button>
        </div>

        {hasPassword === null && (
          <div className="flex justify-center py-8">
            <SpinnerIcon />
          </div>
        )}

        {hasPassword === false && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-white-75">This account signs in with Google, so there is no password to change.</p>
            <button
              type="button"
              onClick={props.onClose}
              className="cursor-pointer rounded-xl border border-black-40 py-3 text-sm font-semibold text-white transition-colors hover:border-white-25"
            >
              Close
            </button>
          </div>
        )}

        {hasPassword === true && (
          <div className="flex flex-col gap-3">
            <InputField id="current-password" label="Current password" isPassword value={currentPassword} onChange={setCurrentPassword} />
            <InputField id="new-password" label="New password" isPassword value={newPassword} onChange={setNewPassword} />
            <InputField id="confirm-new-password" label="Confirm new password" isPassword value={confirmPassword} onChange={setConfirmPassword} />

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`mt-1 rounded-xl py-3 text-sm font-semibold transition-colors ${canSubmit ? 'cursor-pointer bg-primary-100 text-white' : 'cursor-not-allowed bg-primary-100/40 text-white/40'}`}
            >
              {saving ? <SpinnerIcon /> : 'Update password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
