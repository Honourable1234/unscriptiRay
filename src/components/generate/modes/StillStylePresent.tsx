'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateControls } from '@/components/generate/GenerateControls';
import { GenerateOptionsGrid } from '@/components/generate/GenerateOptionsGrid';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useGenerateService } from '@/services/generateService';

type SelectedOptions = {
  star: boolean;
  action: boolean;
  setting: boolean;
  mood: boolean;
  creative: boolean;
};

export const StillStylePresent = (props: {
  initialCharacter?: { id: string; name: string; image: string } | null;
  onGenerated?: () => void;
  onGenerationStart?: (generationId: string) => void;
  onGenerationEnd?: (generationId: string) => void;
}) => {
  const t = useTranslations('StillStylePresent');
  const { generateImage } = useGenerateService();
  const { isGenerating, start } = useGenerationRun();
  const [visual, setVisual] = useState('Cinematic');
  const [orientation, setOrientation] = useState('16:9');
  const [advancedPrompt, setAdvancedPrompt] = useState<string | null>(null);
  const [starCharacter, setStarCharacter] = useState(props.initialCharacter ?? null);
  const [selected, setSelected] = useState<SelectedOptions>({
    star: !!props.initialCharacter,
    action: false,
    setting: false,
    mood: false,
    creative: false,
  });
  const [optionValues, setOptionValues] = useState<{ action: string | null; setting: string | null; mood: string | null }>({
    action: null,
    setting: null,
    mood: null,
  });

  const handleToggle = (key: keyof SelectedOptions) => {
    if (key === 'star' && selected.star) {
      setStarCharacter(null);
    }
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = () => {
    if (!starCharacter) {
      return;
    }
    void start(() => generateImage({
      character_ids: [starCharacter.id],
      visual: visual.toLowerCase(),
      orientation,
      quality: 'balance',
      ...(optionValues.action ? { action: optionValues.action } : {}),
      ...(optionValues.setting ? { setting: optionValues.setting } : {}),
      ...(optionValues.mood ? { mood: optionValues.mood } : {}),
      ...(advancedPrompt ? { advanced_prompt: advancedPrompt } : {}),
    }), {
      successMessage: t('image_ready'),
      onComplete: props.onGenerated,
      onStart: props.onGenerationStart,
      onSettled: props.onGenerationEnd,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <GenerateOptionsGrid
        selected={selected}
        onToggle={handleToggle}
        starCharacter={starCharacter}
        onStarSelect={(character) => {
          setStarCharacter(character);
          setSelected(prev => ({ ...prev, star: true }));
        }}
        onOptionSelect={(key, value) => setOptionValues(prev => ({ ...prev, [key]: value }))}
        onCreativeChange={setAdvancedPrompt}
      />
      <GenerateControls
        visual={visual}
        orientation={orientation}
        onVisualChange={setVisual}
        onOrientationChange={setOrientation}
      />
      <GenerateButton
        label={isGenerating ? t('generating') : t('generate_image')}
        coins={10}
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!starCharacter}
      />
    </div>
  );
};
