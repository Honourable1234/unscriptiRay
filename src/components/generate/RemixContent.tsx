'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useGenerateService } from '@/services/generateService';
import { GenerateButton } from './GenerateButton';
import { GenerateControls } from './GenerateControls';
import { GenerateOptionsGrid } from './GenerateOptionsGrid';

type Selected = Record<'star' | 'action' | 'setting' | 'mood' | 'creative', boolean>;

type StarCharacter = { id: string; name: string; image: string };

export const RemixContent = (props: { onSuccess?: () => void }) => {
  const t = useTranslations('RemixContent');
  const { generateImage } = useGenerateService();
  const { isGenerating, start } = useGenerationRun();
  const [visual, setVisual] = useState('Cinematic');
  const [orientation, setOrientation] = useState('16:9');
  const [selected, setSelected] = useState<Selected>({ star: false, action: false, setting: false, mood: false, creative: false });
  const [stars, setStars] = useState<StarCharacter[]>([]);
  const [advancedPrompt, setAdvancedPrompt] = useState<string | null>(null);
  const [optionValues, setOptionValues] = useState<{ action: string | null; setting: string | null; mood: string | null }>({ action: null, setting: null, mood: null });

  const toggle = (key: keyof Selected) => setSelected(prev => ({ ...prev, [key]: !prev[key] }));

  const handleStarsChange = (characters: StarCharacter[]) => {
    setStars(characters);
    setSelected(prev => ({ ...prev, star: characters.length > 0 }));
  };

  const handleOptionSelect = (key: 'action' | 'setting' | 'mood', value: string | null) => {
    setOptionValues(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    if (stars.length === 0) {
      toast.error(t('select_star_first'));
      return;
    }
    void start(() => generateImage({
      character_ids: stars.map(s => s.id),
      action: optionValues.action ?? undefined,
      setting: optionValues.setting ?? undefined,
      mood: optionValues.mood ?? undefined,
      visual: visual.toLowerCase(),
      orientation,
      quality: 'balance',
      ...(advancedPrompt ? { advanced_prompt: advancedPrompt } : {}),
    }), { successMessage: t('scene_ready'), onComplete: props.onSuccess });
  };

  return (
    <div className="flex flex-col gap-2">
      <GenerateOptionsGrid
        selected={selected}
        onToggle={toggle}
        onOptionSelect={handleOptionSelect}
        onCreativeChange={setAdvancedPrompt}
        starCharacters={stars}
        onStarsChange={handleStarsChange}
      />
      <GenerateControls
        visual={visual}
        orientation={orientation}
        onVisualChange={setVisual}
        onOrientationChange={setOrientation}
      />
      <GenerateButton
        label={isGenerating ? t('generating') : t('remix_scene')}
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
