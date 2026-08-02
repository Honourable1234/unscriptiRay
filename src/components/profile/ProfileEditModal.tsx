'use client';

import type { UpdateProfileBody } from '@/services/useUserService';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { CloseIcon, SpinnerIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useGenerateService } from '@/services/generateService';
import { useUserService } from '@/services/useUserService';
import { isValidImageSrc } from '@/utils/isValidImageSrc';

const Field = (props: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium text-white-75">{props.label}</span>
    <input
      value={props.value}
      onChange={e => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      className="h-11 w-full rounded-xl border border-black-40 bg-black-60 px-4 text-sm text-white outline-none placeholder:text-white-25 focus:border-primary-100"
    />
  </label>
);

export const ProfileEditModal = (props: { onClose: () => void }) => {
  const t = useTranslations('ProfileEditModal');
  const { user, refreshUser } = useAuth();
  const { updateProfile } = useUserService();
  const { uploadReference } = useGenerateService();
  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [imageUrl, setImageUrl] = useState(user?.image_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Only edited fields go up, so a field left alone is never rewritten.
  const body: UpdateProfileBody = {
    ...(displayName.trim() !== (user?.display_name ?? '') ? { display_name: displayName.trim() } : {}),
    ...(username.trim() !== (user?.username ?? '') ? { username: username.trim() } : {}),
    ...(imageUrl !== (user?.image_url ?? '') ? { image_url: imageUrl } : {}),
  };
  const hasChanges = Object.keys(body).length > 0;
  const busy = saving || uploading;

  const handleUpload = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    setUploading(true);
    try {
      const { url } = await uploadReference(file);
      setImageUrl(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast_upload_failed'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    setSaving(true);
    updateProfile(body).then((res) => {
      if (res?.success === false) {
        toast.error(res.message || t('toast_save_failed'));
        setSaving(false);
        return;
      }
      toast.success(t('toast_saved'));
      refreshUser();
      props.onClose();
    }).catch((error: unknown) => {
      setSaving(false);
      toast.error(error instanceof Error ? error.message : t('toast_save_failed'));
    });
  };

  const avatarInitial = (displayName || username || user?.email || '?').slice(0, 2).toUpperCase();

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={() => !busy && props.onClose()}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !busy) {
          props.onClose();
        }
      }}
    >
      <div
        role="presentation"
        className="relative w-full max-w-105 rounded-2xl border border-white-25 bg-black-80 px-6 py-6"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between border-b border-black-40 pb-4">
          <h2 className="text-base font-semibold text-white">{t('title')}</h2>
          <button onClick={props.onClose} disabled={busy} className="cursor-pointer text-white-75 hover:text-white disabled:opacity-50">
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-black-60">
              {isValidImageSrc(imageUrl)
                ? <Image src={imageUrl} alt="" fill sizes="64px" className="object-cover" />
                : <span className="flex h-full w-full items-center justify-center text-lg font-bold text-white">{avatarInitial}</span>}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <SpinnerIcon />
                </div>
              )}
            </div>
            <label className="cursor-pointer rounded-xl border border-black-20 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-primary-100 hover:text-primary-100">
              {uploading ? t('uploading') : t('change_photo')}
              <input
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={e => void handleUpload(e.target.files?.[0])}
                className="hidden"
              />
            </label>
          </div>

          <Field label={t('display_name')} value={displayName} placeholder={t('display_name_placeholder')} onChange={setDisplayName} />
          <Field label={t('username')} value={username} placeholder={t('username_placeholder')} onChange={setUsername} />

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || busy}
            className={`mt-1 rounded-xl py-3 text-sm font-semibold transition-colors ${hasChanges && !busy ? 'cursor-pointer bg-primary-100 text-white' : 'cursor-not-allowed bg-primary-100/40 text-white/40'}`}
          >
            {saving ? <SpinnerIcon /> : t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};
