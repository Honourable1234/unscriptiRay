'use client';

import type { GenerateType } from '@/components/generate/GenerateTypeToggle';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateControls } from '@/components/generate/GenerateControls';
import { GenerateEmptyState } from '@/components/generate/GenerateEmptyState';
import { GenerateOptionsGrid } from '@/components/generate/GenerateOptionsGrid';
import { GenerateResultGrid } from '@/components/generate/GenerateResultGrid';
import { GenerateTypeToggle } from '@/components/generate/GenerateTypeToggle';
import { MediaStyleTab } from '@/components/generate/MediaStyleTab';

type Tab = 'All' | 'Images' | 'Videos';

type SelectedOptions = {
  star: boolean;
  action: boolean;
  setting: boolean;
  mood: boolean;
  creative: boolean;
};

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const characterId = searchParams.get('characterId') ?? '';
  const characterName = searchParams.get('characterName') ?? '';
  const characterImage = searchParams.get('characterImage') ?? '';

  const [activeType, setActiveType] = useState<GenerateType>('still');
  const [mediaTab, setMediaTab] = useState<Tab>('All');
  const [visual, setVisual] = useState('Cinematic');
  const [orientation, setOrientation] = useState('16:9');
  const [hasResults, setHasResults] = useState(true);
  const [starCharacter, setStarCharacter] = useState<{ id: string; name: string; image: string } | null>(
    characterId ? { id: characterId, name: characterName, image: characterImage } : null,
  );
  const [selected, setSelected] = useState<SelectedOptions>({
    star: !!characterId,
    action: false,
    setting: false,
    mood: false,
    creative: false,
  });

  const handleToggle = (key: keyof SelectedOptions) => {
    if (key === 'star' && selected.star) {
      setStarCharacter(null);
    }
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

      <GenerateOptionsGrid
        selected={selected}
        onToggle={handleToggle}
        starCharacter={starCharacter}
        onStarSelect={(character) => {
          setStarCharacter(character);
          setSelected(prev => ({ ...prev, star: true }));
        }}
      />

      <GenerateControls
        visual={visual}
        orientation={orientation}
        onVisualChange={setVisual}
        onOrientationChange={setOrientation}
      />

      <GenerateButton coins={10} onClick={() => {}} />

      <div className="flex items-center justify-between">
        <MediaStyleTab tab={mediaTab} onTabChange={setMediaTab} />
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
