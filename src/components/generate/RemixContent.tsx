'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ActionIcon, CaptureIcon, EmojiIcon, SelectStarIcon } from '@/components/icons';
import { GenerateControls } from './GenerateControls';
import { GenerateOptionCard } from './GenerateOptionCard';
import { GenerateOptionCardWide } from './GenerateOptionCardWide';

type Selected = Record<'star' | 'action' | 'setting' | 'mood' | 'creative', boolean>;

export const RemixContent = () => {
  const t = useTranslations('GenerateOptionsGrid');
  const [visual, setVisual] = useState('Cinematic');
  const [orientation, setOrientation] = useState('16:9');
  const [selected, setSelected] = useState<Selected>({ star: false, action: false, setting: false, mood: false, creative: false });

  const options: { key: keyof Selected; label: string; sublabel: string; icon: React.ReactNode }[] = [
    { key: 'star', label: t('select_star'), sublabel: t('required'), icon: <SelectStarIcon /> },
    { key: 'action', label: t('action'), sublabel: t('optional'), icon: <ActionIcon /> },
    { key: 'setting', label: t('setting'), sublabel: t('optional'), icon: <CaptureIcon /> },
    { key: 'mood', label: t('mood'), sublabel: t('optional'), icon: <EmojiIcon /> },
  ];
  const toggle = (key: keyof Selected) => setSelected(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map(opt => (
          <GenerateOptionCard
            key={opt.key}
            label={opt.label}
            sublabel={opt.sublabel}
            icon={opt.icon}
            isSelected={selected[opt.key]}
            height="152px"
            onClick={() => toggle(opt.key)}
          />
        ))}
      </div>
      <GenerateOptionCardWide
        label={t('creative_input')}
        sublabel={t('creator_tier')}
        icon={<CaptureIcon />}
        isSelected={selected.creative}
        height="135px"
        onClick={() => toggle('creative')}
      />
      <GenerateControls
        visual={visual}
        orientation={orientation}
        onVisualChange={setVisual}
        onOrientationChange={setOrientation}
      />
    </div>
  );
};
