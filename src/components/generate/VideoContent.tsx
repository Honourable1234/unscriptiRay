'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CaptureIcon, MotionIcon, SelectStarIcon } from '@/components/icons';
import { GenerateOptionCard } from './GenerateOptionCard';
import { GenerateOptionCardWide } from './GenerateOptionCardWide';
import { GenerateVideoControls } from './GenerateVideoControls';

export const VideoContent = () => {
  const tGrid = useTranslations('GenerateOptionsGrid');
  const t = useTranslations('VideoContent');
  const [quality, setQuality] = useState('Balanced');
  const [orientation, setOrientation] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  const [audio, setAudio] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3">
        <GenerateOptionCard
          label={tGrid('select_star')}
          sublabel={tGrid('required')}
          height="200px"
          icon={<SelectStarIcon />}
        />
        <GenerateOptionCard
          label={t('motion')}
          sublabel={tGrid('required')}
          height="200px"
          icon={<MotionIcon />}
        />
      </div>

      <GenerateOptionCardWide
        label={tGrid('creative_input')}
        sublabel={tGrid('creator_tier')}
        height="107px"
        icon={<CaptureIcon />}
      />

      <GenerateVideoControls
        quality={quality}
        orientation={orientation}
        duration={duration}
        audio={audio}
        onQualityChange={setQuality}
        onOrientationChange={setOrientation}
        onDurationChange={setDuration}
        onAudioToggle={() => setAudio(prev => !prev)}
      />
    </div>
  );
};
