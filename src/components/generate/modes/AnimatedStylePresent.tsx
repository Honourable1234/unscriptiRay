'use client';

import type { Scene } from '@/components/generate/AudioModal';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SignUpPromptModal } from '@/components/general/SignUpPromptModal';
import { AudioModal } from '@/components/generate/AudioModal';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateOptionsGrid } from '@/components/generate/GenerateOptionsGrid';
import { GenerateVideoControls } from '@/components/generate/GenerateVideoControls';
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

export const AnimatedStylePresent = (props: {
  initialCharacter?: StarCharacter | null;
  onGenerated?: () => void;
  onGenerationStart?: (generationId: string, orientation: string) => void;
  onGenerationEnd?: (generationId: string) => void;
}) => {
  const t = useTranslations('AnimatedStylePresent');
  const tPrompt = useTranslations('SignUpPrompts');
  const { generateVideo } = useGenerateService();
  const { isGenerating, needsSignUp, dismissSignUpPrompt, start } = useGenerationRun();
  const [quality, setQuality] = useSessionState('generate:animated_style_present:quality', 'Balanced');
  const [orientation, setOrientation] = useSessionState('generate:animated_style_present:orientation', '16:9');
  const [duration, setDuration] = useSessionState('generate:animated_style_present:duration', '5s');
  const [audioOpen, setAudioOpen] = useState(false);
  const [audio, setAudio] = useSessionState<{ script: string; sceneEmotion: Scene; voiceType: string }>('generate:animated_style_present:audio', {
    script: '',
    sceneEmotion: 'Happy',
    voiceType: 'Aurora',
  });
  const [stars, setStars] = useSessionState<StarCharacter[]>('generate:animated_style_present:stars', props.initialCharacter ? [props.initialCharacter] : []);
  const [selected, setSelected] = useSessionState<SelectedOptions>('generate:animated_style_present:selected', {
    star: !!props.initialCharacter,
    action: false,
    setting: false,
    mood: false,
    creative: false,
  });
  const [optionValues, setOptionValues] = useSessionState<{ action: string | null; setting: string | null; mood: string | null }>('generate:animated_style_present:option_values', {
    action: null,
    setting: null,
    mood: null,
  });
  const [advancedPrompt, setAdvancedPrompt] = useSessionState<string | null>('generate:animated_style_present:advanced_prompt', null);
  // GenerateOptionsGrid seeds its displayed cards once from initialOptions/initialCreative,
  // so a plain state reset alone would not visually clear them — remounting it does.
  const [resetKey, setResetKey] = useState(0);

  const resetForm = () => {
    setQuality('Balanced');
    setOrientation('16:9');
    setDuration('5s');
    setAudio({ script: '', sceneEmotion: 'Happy', voiceType: 'Aurora' });
    setStars([]);
    setSelected({ star: false, action: false, setting: false, mood: false, creative: false });
    setOptionValues({ action: null, setting: null, mood: null });
    setAdvancedPrompt(null);
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
    void start(() => generateVideo({
      character_ids: stars.map(s => s.id),
      mode: 'style_preset',
      orientation,
      quality: quality === 'Balanced' ? 'balance' : 'ultra',
      duration: Number(duration.replace('s', '')),
      ...(optionValues.action ? { action: optionValues.action } : {}),
      ...(optionValues.setting ? { setting: optionValues.setting } : {}),
      ...(optionValues.mood ? { mood: optionValues.mood } : {}),
      ...(advancedPrompt ? { advanced_prompt: advancedPrompt } : {}),
      ...(audio.script && {
        script: audio.script,
        scene_emotion: audio.sceneEmotion.toLowerCase(),
        voice_type: audio.voiceType.toLowerCase(),
      }),
    }), {
      successMessage: t('scene_ready'),
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
        multipleStars
        onOptionSelect={(key, value) => setOptionValues(prev => ({ ...prev, [key]: value }))}
        onCreativeChange={setAdvancedPrompt}
        initialOptions={optionValues}
        initialCreative={advancedPrompt}
      />
      <GenerateVideoControls
        quality={quality}
        orientation={orientation}
        duration={duration}
        audio={!!audio.script}
        onQualityChange={setQuality}
        onOrientationChange={setOrientation}
        onDurationChange={setDuration}
        onAudioToggle={() => setAudioOpen(true)}
      />
      <GenerateButton
        label={isGenerating ? t('generating') : t('generate_scene')}
        coins={30}
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={stars.length === 0}
      />
      {audioOpen && (
        <AudioModal
          script={audio.script}
          sceneEmotion={audio.sceneEmotion}
          voiceType={audio.voiceType}
          onSave={values => setAudio(values)}
          onClose={() => setAudioOpen(false)}
        />
      )}
      {needsSignUp && (
        <SignUpPromptModal
          description={tPrompt('generate_scenes')}
          onClose={dismissSignUpPrompt}
        />
      )}
    </div>
  );
};
