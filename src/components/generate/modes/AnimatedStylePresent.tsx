'use client';

import type { Scene } from '@/components/generate/AudioModal';
import { useState } from 'react';
import { AudioModal } from '@/components/generate/AudioModal';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateOptionsGrid } from '@/components/generate/GenerateOptionsGrid';
import { GenerateVideoControls } from '@/components/generate/GenerateVideoControls';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useGenerateService } from '@/services/generateService';

type SelectedOptions = {
  star: boolean;
  action: boolean;
  setting: boolean;
  mood: boolean;
  creative: boolean;
};

type SceneData = { id: number; sourceImageId: string | null; motion: string | null };

export const AnimatedStylePresent = (props: {
  initialCharacter?: { id: string; name: string; image: string } | null;
  onGenerated?: () => void;
  onGenerationStart?: (generationId: string) => void;
  onGenerationEnd?: (generationId: string) => void;
}) => {
  const { generateVideo } = useGenerateService();
  const { isGenerating, start } = useGenerationRun();
  const [quality, setQuality] = useState('Balanced');
  const [orientation, setOrientation] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  const [audioOpen, setAudioOpen] = useState(false);
  const [audio, setAudio] = useState<{ script: string; sceneEmotion: Scene; voiceType: string }>({
    script: '',
    sceneEmotion: 'Happy',
    voiceType: 'Aurora',
  });
  const [scenes, setScenes] = useState<SceneData[]>([{ id: 1, sourceImageId: null, motion: null }]);
  const [activeSceneId, setActiveSceneId] = useState(1);
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

  const activeScene = scenes.find(s => s.id === activeSceneId) ?? scenes[0]!;

  const handleToggle = (key: keyof SelectedOptions) => {
    if (key === 'star' && selected.star) {
      setStarCharacter(null);
    }
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addScene = () => {
    const newId = Math.max(...scenes.map(s => s.id)) + 1;
    setScenes(prev => [...prev, { id: newId, sourceImageId: null, motion: null }]);
    setActiveSceneId(newId);
  };

  const handleGenerate = () => {
    void start(() => generateVideo({
      character_ids: starCharacter ? [starCharacter.id] : [],
      mode: 'style_preset',
      orientation,
      quality: quality === 'Balanced' ? 'balance' : 'ultra',
      duration: Number(duration.replace('s', '')),
      ...(optionValues.action ? { action: optionValues.action } : {}),
      ...(optionValues.setting ? { setting: optionValues.setting } : {}),
      ...(optionValues.mood ? { mood: optionValues.mood } : {}),
      ...(audio.script && {
        script: audio.script,
        scene_emotion: audio.sceneEmotion.toLowerCase(),
        voice_type: audio.voiceType.toLowerCase(),
      }),
    }), {
      successMessage: 'Scene ready!',
      onComplete: props.onGenerated,
      onStart: props.onGenerationStart,
      onSettled: props.onGenerationEnd,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2">
        {scenes.map(scene => (
          <button
            key={scene.id}
            onClick={() => setActiveSceneId(scene.id)}
            className={`cursor-pointer rounded-lg p-3 text-xs font-medium transition-colors ${activeScene.id === scene.id ? 'bg-primary-100/10 text-primary-100' : 'text-white hover:bg-black-40'}`}
          >
            {`Scene ${scene.id}`}
          </button>
        ))}
        <button
          onClick={addScene}
          className="flex cursor-pointer items-center gap-1 rounded-lg p-3 text-xs font-medium text-white transition-all hover:scale-105"
        >
          <PlusIcon />
          Add
        </button>
      </div>
      <GenerateOptionsGrid
        selected={selected}
        onToggle={handleToggle}
        starCharacter={starCharacter}
        onStarSelect={(character) => {
          setStarCharacter(character);
          setSelected(prev => ({ ...prev, star: true }));
        }}
        onOptionSelect={(key, value) => setOptionValues(prev => ({ ...prev, [key]: value }))}
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
        label={isGenerating ? 'Generating...' : 'Generate Scene'}
        coins={30}
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!starCharacter}
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
    </div>
  );
};
