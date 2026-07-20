'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useGenerateService } from '@/services/generateService';
import { GenerateButton } from './GenerateButton';
import { GenerateControls } from './GenerateControls';
import { GenerateOptionsGrid } from './GenerateOptionsGrid';

type Selected = Record<'star' | 'action' | 'setting' | 'mood' | 'creative', boolean>;

export const RemixContent = (props: { onSuccess?: () => void }) => {
  const { generateImage } = useGenerateService();
  const { isGenerating, start } = useGenerationRun();
  const [visual, setVisual] = useState('Cinematic');
  const [orientation, setOrientation] = useState('16:9');
  const [selected, setSelected] = useState<Selected>({ star: false, action: false, setting: false, mood: false, creative: false });
  const [starCharacter, setStarCharacter] = useState<{ id: string; name: string; image: string } | null>(null);
  const [advancedPrompt, setAdvancedPrompt] = useState<string | null>(null);
  const [optionValues, setOptionValues] = useState<{ action: string | null; setting: string | null; mood: string | null }>({ action: null, setting: null, mood: null });

  const toggle = (key: keyof Selected) => setSelected(prev => ({ ...prev, [key]: !prev[key] }));

  const handleStarSelect = (character: { id: string; name: string; image: string }) => {
    setStarCharacter(character);
    setSelected(prev => ({ ...prev, star: true }));
  };

  const handleOptionSelect = (key: 'action' | 'setting' | 'mood', value: string | null) => {
    setOptionValues(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    if (!starCharacter) {
      toast.error('Please select a star first.');
      return;
    }
    void start(() => generateImage({
      character_ids: [starCharacter.id],
      action: optionValues.action ?? undefined,
      setting: optionValues.setting ?? undefined,
      mood: optionValues.mood ?? undefined,
      visual: visual.toLowerCase(),
      orientation,
      quality: 'balance',
      ...(advancedPrompt ? { advanced_prompt: advancedPrompt } : {}),
    }), { successMessage: 'Scene ready!', onComplete: props.onSuccess });
  };

  return (
    <div className="flex flex-col gap-2">
      <GenerateOptionsGrid
        selected={selected}
        onToggle={toggle}
        onOptionSelect={handleOptionSelect}
        onCreativeChange={setAdvancedPrompt}
        starCharacter={starCharacter}
        onStarSelect={handleStarSelect}
      />
      <GenerateControls
        visual={visual}
        orientation={orientation}
        onVisualChange={setVisual}
        onOrientationChange={setOrientation}
      />
      <GenerateButton
        label={isGenerating ? 'Generating...' : 'Remix Scene'}
        coins={10}
        onClick={handleGenerate}
        isLoading={isGenerating}
        py="py-2"
        px="px-4"
        textSize="text-xs"
      />
    </div>
  );
};
