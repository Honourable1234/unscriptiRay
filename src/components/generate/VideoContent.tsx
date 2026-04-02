'use client';

import { useState } from 'react';
import { CaptureIcon, MotionIcon, SelectStarIcon } from '@/components/icons';
import { GenerateOptionCard } from './GenerateOptionCard';
import { GenerateOptionCardWide } from './GenerateOptionCardWide';
import { GenerateVideoControls } from './GenerateVideoControls';

export const VideoContent = () => {
  const [quality, setQuality] = useState('Balanced');
  const [orientation, setOrientation] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  const [audio, setAudio] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3">
        <GenerateOptionCard
          label="Select Star"
          sublabel="(Required)"
          height="200px"
          icon={<SelectStarIcon />}
        />
        <GenerateOptionCard
          label="Motion"
          sublabel="(Required)"
          height="200px"
          icon={<MotionIcon />}
        />
      </div>

      <GenerateOptionCardWide
        label="Creative Input (Advanced)"
        sublabel="Creator Tier Exclusive"
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
