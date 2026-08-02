'use client';

import type { CharacterVisibility } from '@/services/useCharacterService';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCharacterService } from '@/services/useCharacterService';

const options: { value: CharacterVisibility; label: string; hint: string }[] = [
  { value: 'public', label: 'Public', hint: 'Anyone can find this character in Explore.' },
  { value: 'unlisted', label: 'Unlisted', hint: 'Only people with the link can open it.' },
  { value: 'private', label: 'Private', hint: 'Only you can see this character.' },
];

export const CharacterVisibilityField = (props: { id: string; visibility: CharacterVisibility }) => {
  const { updateVisibility } = useCharacterService();
  const [visibility, setVisibility] = useState(props.visibility);
  const [saving, setSaving] = useState(false);

  const handleSelect = (next: CharacterVisibility) => {
    if (next === visibility || saving) {
      return;
    }
    const previous = visibility;
    setVisibility(next);
    setSaving(true);
    updateVisibility(props.id, next)
      .then(() => toast.success(`Character is now ${next}`))
      .catch((error: unknown) => {
        setVisibility(previous);
        toast.error(error instanceof Error ? error.message : 'Could not change visibility');
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-black-60 p-4">
      <span className="text-sm font-semibold text-white">Visibility</span>
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
