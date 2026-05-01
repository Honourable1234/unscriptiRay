'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ActionIcon, EmojiIcon, InputIcon, SelectStarIcon, SettingIcon } from '@/components/icons';
import { GenerateOptionCard } from './GenerateOptionCard';
import { GenerateOptionCardWide } from './GenerateOptionCardWide';
import { SelectStarModal } from './SelectStarModal';

type SelectedOptions = {
  star: boolean;
  action: boolean;
  setting: boolean;
  mood: boolean;
  creative: boolean;
};

export const GenerateOptionsGrid = (props: {
  selected: SelectedOptions;
  onToggle: (key: keyof SelectedOptions) => void;
  starCharacter?: { id: string; name: string; image: string } | null;
  onStarSelect?: (character: { id: string; name: string; image: string }) => void;
}) => {
  const t = useTranslations('GenerateOptionsGrid');
  const [starModalOpen, setStarModalOpen] = useState(false);

  const mainOptions: { key: keyof SelectedOptions; label: string; sublabel: string; icon: React.ReactNode }[] = [
    { key: 'star', label: t('select_star'), sublabel: t('required'), icon: <SelectStarIcon /> },
    { key: 'action', label: t('action'), sublabel: t('optional'), icon: <ActionIcon /> },
    { key: 'setting', label: t('setting'), sublabel: t('optional'), icon: <SettingIcon /> },
    { key: 'mood', label: t('mood'), sublabel: t('optional'), icon: <EmojiIcon /> },
  ];

  const handleActionClick = () => {
    props.onToggle('action');
  };

  const handleStarClick = () => {
    if (props.selected.star) {
      props.onToggle('star');
    } else {
      setStarModalOpen(true);
    }
  };

  const handleStarSelect = (character: { id: string; name: string; image: string }) => {
    props.onStarSelect?.(character);
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-184 flex-col gap-3">
        {/* 4 main cards */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
          {mainOptions.map(opt => (
            <GenerateOptionCard
              key={opt.key}
              label={opt.label}
              sublabel={opt.sublabel}
              icon={opt.icon}
              isSelected={props.selected[opt.key]}
              onClick={opt.key === 'star' ? handleStarClick : opt.key === 'action' ? handleActionClick : () => props.onToggle(opt.key)}
              selectedImage={opt.key === 'star' ? props.starCharacter?.image : undefined}
              selectedName={opt.key === 'star' ? props.starCharacter?.name : undefined}
              onDeselect={opt.key === 'star' ? () => props.onToggle('star') : undefined}
            />
          ))}
        </div>
        {/* Creative Input — separate full-width card */}
        <GenerateOptionCardWide
          label={t('creative_input')}
          sublabel={t('creator_tier')}
          icon={<InputIcon />}
          isSelected={props.selected.creative}
          onClick={() => props.onToggle('creative')}
        />
      </div>

      {starModalOpen && (
        <SelectStarModal
          onSelect={handleStarSelect}
          onClose={() => setStarModalOpen(false)}
        />
      )}
    </>
  );
};
