'use client';

import type { GenerateType } from '@/components/generate/GenerateTypeToggle';
import { useState } from 'react';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateControls } from '@/components/generate/GenerateControls';
import { GenerateEmptyState } from '@/components/generate/GenerateEmptyState';
import { GenerateOptionsGrid } from '@/components/generate/GenerateOptionsGrid';
import { GenerateResultGrid } from '@/components/generate/GenerateResultGrid';
import { GenerateTypeToggle } from '@/components/generate/GenerateTypeToggle';
import { MediaStyleTab } from '@/components/generate/MediaStyleTab';

type SelectedOptions = {
  star: boolean;
  action: boolean;
  setting: boolean;
  mood: boolean;
  creative: boolean;
};

export default function GeneratePage() {
  const [activeType, setActiveType] = useState<GenerateType>('still');
  const [visual, setVisual] = useState('Cinematic');
  const [orientation, setOrientation] = useState('16:9');
  const [hasResults, setHasResults] = useState(true);
  const [selected, setSelected] = useState<SelectedOptions>({
    star: false,
    action: false,
    setting: false,
    mood: false,
    creative: false,
  });

  const handleToggle = (key: keyof SelectedOptions) => {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 py-6">
      <h1 className="text-center text-xl font-bold text-white sm:text-2xl md:text-[32px]">
        Build Your
        {' '}
        <span className="text-primary-100">Fantasy Scene</span>
      </h1>

      <GenerateTypeToggle
        active={activeType}
        onChange={setActiveType}
        onModeClick={() => {}}
      />

      <GenerateOptionsGrid selected={selected} onToggle={handleToggle} />

      <GenerateControls
        visual={visual}
        orientation={orientation}
        onVisualChange={setVisual}
        onOrientationChange={setOrientation}
      />

      <GenerateButton coins={10} onClick={() => {}} />

      <div className="flex items-center justify-between">
        <MediaStyleTab />
        <button
          onClick={() => setHasResults(prev => !prev)}
          className="cursor-pointer rounded-lg border border-black-40 px-3 py-1.5 text-xs text-white-75 hover:text-white"
        >
          Toggle:
          {' '}
          {hasResults ? 'Results' : 'Empty'}
        </button>
      </div>

      {hasResults ? <GenerateResultGrid /> : <GenerateEmptyState />}
    </div>
  );
}
