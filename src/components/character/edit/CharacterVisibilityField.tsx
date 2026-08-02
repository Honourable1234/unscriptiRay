'use client';

import type { CharacterVisibility } from '@/services/useCharacterService';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCharacterService } from '@/services/useCharacterService';

export const CharacterVisibilityField = (props: { id: string; visibility: CharacterVisibility }) => {
  const t = useTranslations('CharacterVisibilityField');
  const { updateVisibility } = useCharacterService();
  const [visibility, setVisibility] = useState(props.visibility);
  const [saving, setSaving] = useState(false);

  const options: { value: CharacterVisibility; label: string; hint: string }[] = [
    { value: 'public', label: t('public_label'), hint: t('public_hint') },
    { value: 'unlisted', label: t('unlisted_label'), hint: t('unlisted_hint') },
    { value: 'private', label: t('private_label'), hint: t('private_hint') },
  ];

  const handleSelect = (next: CharacterVisibility) => {
    if (next === visibility || saving) {
      return;
    }
    const previous = visibility;
    setVisibility(next);
    setSaving(true);
    updateVisibility(props.id, next)
      .then(() => toast.success(t('toast_updated', { visibility: next })))
      .catch((error: unknown) => {
        setVisibility(previous);
        toast.error(error instanceof Error ? error.message : t('toast_failed'));
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-black-60 p-4">
      <span className="text-sm font-semibold text-white">{t('title')}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            disabled={saving}
            className={`flex-1 cursor-pointer rounded-xl px-4 py-3 text-left transition-colors disabled:cursor-not-allowed ${visibility === option.value ? 'border border-primary-100 bg-primary-100/10' : 'border border-black-40 hover:border-white-25'}`}
          >
            <span className={`block text-xs font-semibold ${visibility === option.value ? 'text-primary-100' : 'text-white'}`}>{option.label}</span>
            <span className="block text-[11px] text-white-75">{option.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
