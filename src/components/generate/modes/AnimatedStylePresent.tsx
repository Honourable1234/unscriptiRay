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
  onGenerationStart?: (generationId: string) => void;
  onGenerationEnd?: (generationId: string) => void;
}) => {
  const t = useTranslations('AnimatedStylePresent');
  const { generateVideo } = useGenerateService();
  const { isGenerating, needsSignUp, dismissSignUpPrompt, start } = useGenerationRun();
  const [quality, setQuality] = useState('Balanced');
  const [orientation, setOrientation] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  const [audioOpen, setAudioOpen] = useState(false);
  const [audio, setAudio] = useState<{ script: string; sceneEmotion: Scene; voiceType: string }>({
    script: '',
    sceneEmotion: 'Happy',
    voiceType: 'Aurora',
  });
  const [stars, setStars] = useState<StarCharacter[]>(props.initialCharacter ? [props.initialCharacter] : []);
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
  const [advancedPrompt, setAdvancedPrompt] = useState<string | null>(null);

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
        starCharacters={stars}
        onStarsChange={handleStarsChange}
        multipleStars
        onOptionSelect={(key, value) => setOptionValues(prev => ({ ...prev, [key]: value }))}
        onCreativeChange={setAdvancedPrompt}
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
          description="Sign up to generate scenes — your creations will be saved to your account."
          onClose={dismissSignUpPrompt}
        />
      )}
    </div>
  );
};
