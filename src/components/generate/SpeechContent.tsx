'use client';

import { useState } from 'react';
import { InputIcon, MediaIcon2, SelectStarIcon } from '@/components/icons';
import { GenerateOptionCard } from './GenerateOptionCard';
import { GenerateOptionCardWide } from './GenerateOptionCardWide';

const scenes = ['Happy', 'Natural', 'Sad', 'Angry', 'Fearful', 'Disgusted', 'Surprised'];

export const SpeechContent = () => {
  const [scene, setScene] = useState('Happy');

  return (
    <div className="flex flex-col gap-3">
      {/* Cards */}
      <div className="grid grid-cols-2 gap-2">
        <GenerateOptionCard
          label="Select Star"
          sublabel="(Required)"
          icon={<SelectStarIcon />}
          height="200px"
        />
        <GenerateOptionCard
          label="Aurora"
          sublabel="(Character default)"
          icon={<MediaIcon2 />}
          height="200px"
        />
      </div>

      {/* Scene */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-white">Scene</span>
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
        label="Audio Script"
        sublabel="(Required)"
        height="105px"
        icon={<InputIcon />}
      />
    </div>
  );
};
