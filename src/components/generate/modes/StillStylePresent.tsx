'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SignUpPromptModal } from '@/components/general/SignUpPromptModal';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateControls } from '@/components/generate/GenerateControls';
import { GenerateOptionsGrid } from '@/components/generate/GenerateOptionsGrid';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useSessionState } from '@/hooks/useSessionState';
import { useGenerateService } from '@/services/generateService';

type SelectedOptions = {
  star: boolean;
  action: boolean;
  setting: boolean;
  mood: boolean;
  creative: boolean;
};

type StarCharacter = { id: string; name: string; image: string };

export const StillStylePresent = (props: {
  initialCharacter?: StarCharacter | null;
  onGenerated?: () => void;
  onGenerationStart?: (generationId: string, orientation: string) => void;
  onGenerationEnd?: (generationId: string) => void;
}) => {
  const t = useTranslations('StillStylePresent');
  const tPrompt = useTranslations('SignUpPrompts');
  const { generateImage } = useGenerateService();
  const { isGenerating, needsSignUp, dismissSignUpPrompt, start } = useGenerationRun();
  const [visual, setVisual] = useSessionState('generate:still_style_present:visual', 'Cinematic');
  const [orientation, setOrientation] = useSessionState('generate:still_style_present:orientation', '16:9');
  const [advancedPrompt, setAdvancedPrompt] = useSessionState<string | null>('generate:still_style_present:advanced_prompt', null);
  const [stars, setStars] = useSessionState<StarCharacter[]>('generate:still_style_present:stars', props.initialCharacter ? [props.initialCharacter] : []);
  const [selected, setSelected] = useSessionState<SelectedOptions>('generate:still_style_present:selected', {
    star: !!props.initialCharacter,
    action: false,
    setting: false,
    mood: false,
    creative: false,
  });
  const [optionValues, setOptionValues] = useSessionState<{ action: string | null; setting: string | null; mood: string | null }>('generate:still_style_present:option_values', {
    action: null,
    setting: null,
    mood: null,
  });
  // GenerateOptionsGrid seeds its displayed cards once from initialOptions/initialCreative,
  // so a plain state reset alone would not visually clear them — remounting it does.
  const [resetKey, setResetKey] = useState(0);

  const resetForm = () => {
    setVisual('Cinematic');
    setOrientation('16:9');
    setAdvancedPrompt(null);
    setStars([]);
    setSelected({ star: false, action: false, setting: false, mood: false, creative: false });
    setOptionValues({ action: null, setting: null, mood: null });
    setResetKey(key => key + 1);
  };

  const handleToggle = (key: keyof SelectedOptions) => {
    if (key === 'star' && selected.star) {
      setStars([]);
    }
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStarsChange = (characters: StarCharacter[]) => {
    setStars(characters);
    setSelected(prev => ({ ...prev, star: characters.length > 0 }));
  };

  const handleGenerate = () => {
    if (stars.length === 0) {
      return;
    }
    void start(() => generateImage({
      character_ids: stars.map(s => s.id),
      visual: visual.toLowerCase(),
      orientation,
      quality: 'balance',
      ...(optionValues.action ? { action: optionValues.action } : {}),
      ...(optionValues.setting ? { setting: optionValues.setting } : {}),
      ...(optionValues.mood ? { mood: optionValues.mood } : {}),
      ...(advancedPrompt ? { advanced_prompt: advancedPrompt } : {}),
    }), {
      successMessage: t('image_ready'),
      onComplete: () => {
        props.onGenerated?.();
        resetForm();
      },
      onStart: id => props.onGenerationStart?.(id, orientation),
      onSettled: props.onGenerationEnd,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <GenerateOptionsGrid
        key={resetKey}
        selected={selected}
        onToggle={handleToggle}
        starCharacters={stars}
        onStarsChange={handleStarsChange}
        onOptionSelect={(key, value) => setOptionValues(prev => ({ ...prev, [key]: value }))}
        onCreativeChange={setAdvancedPrompt}
        initialOptions={optionValues}
        initialCreative={advancedPrompt}
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
        disabled={stars.length === 0}
      />
      {needsSignUp && (
        <SignUpPromptModal
          description={tPrompt('generate_scenes')}
          onClose={dismissSignUpPrompt}
        />
      )}
    </div>
  );
};
