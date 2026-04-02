'use client';

import { useState } from 'react';
import { ActionIcon, CaptureIcon, EmojiIcon, SelectStarIcon } from '@/components/icons';
import { GenerateControls } from './GenerateControls';
import { GenerateOptionCard } from './GenerateOptionCard';
import { GenerateOptionCardWide } from './GenerateOptionCardWide';

const options = [
  { key: 'star' as const, label: 'Select Star', sublabel: '(Required)', icon: <SelectStarIcon /> },
  { key: 'action' as const, label: 'Action', sublabel: '(Optional)', icon: <ActionIcon /> },
  { key: 'setting' as const, label: 'Setting', sublabel: '(Optional)', icon: <CaptureIcon /> },
  { key: 'mood' as const, label: 'Mood', sublabel: '(Optional)', icon: <EmojiIcon /> },
];

type Selected = Record<'star' | 'action' | 'setting' | 'mood' | 'creative', boolean>;

export const RemixContent = () => {
  const [visual, setVisual] = useState('Cinematic');
  const [orientation, setOrientation] = useState('16:9');
  const [selected, setSelected] = useState<Selected>({ star: false, action: false, setting: false, mood: false, creative: false });
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
        label="Creative Input (Advanced)"
        sublabel="Creator Tier Exclusive"
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
