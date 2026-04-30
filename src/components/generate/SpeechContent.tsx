'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { InputIcon, MediaIcon2, SelectStarIcon } from '@/components/icons';
import { GenerateOptionCard } from './GenerateOptionCard';
import { GenerateOptionCardWide } from './GenerateOptionCardWide';

const scenes = ['Happy', 'Natural', 'Sad', 'Angry', 'Fearful', 'Disgusted', 'Surprised'];

export const SpeechContent = () => {
  const t = useTranslations('SpeechContent');
  const tGrid = useTranslations('GenerateOptionsGrid');
  const [scene, setScene] = useState('Happy');

  return (
    <div className="flex flex-col gap-3">
      {/* Cards */}
      <div className="grid grid-cols-2 gap-2">
        <GenerateOptionCard
          label={tGrid('select_star')}
          sublabel={tGrid('required')}
          icon={<SelectStarIcon />}
          height="200px"
        />
        <GenerateOptionCard
          label="Aurora"
          sublabel={t('aurora_sublabel')}
          icon={<MediaIcon2 />}
          height="200px"
        />
      </div>

      {/* Scene */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-white">{t('scene_label')}</span>
        <div className="flex flex-wrap gap-1.5">
          {scenes.map(s => (
            <button
              key={s}
              onClick={() => setScene(s)}
              className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${scene === s ? 'bg-primary-100 text-white' : ' bg-black-40 text-white-75 hover:border-white-75'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Script */}
      <GenerateOptionCardWide
        label={t('audio_script')}
        sublabel={tGrid('required')}
        height="105px"
        icon={<InputIcon />}
      />
    </div>
  );
};
