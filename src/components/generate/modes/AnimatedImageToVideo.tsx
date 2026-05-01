'use client';

import type { Scene } from '@/components/generate/AudioModal';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { AudioModal } from '@/components/generate/AudioModal';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateOptionCard } from '@/components/generate/GenerateOptionCard';
import { GenerateOptionCardWide } from '@/components/generate/GenerateOptionCardWide';
import { GenerateVideoControls } from '@/components/generate/GenerateVideoControls';
import { CaptureIcon, MotionIcon } from '@/components/icons';
import { ImageFrameIcon } from '@/components/icons/ImageFramIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { useGenerateService } from '@/services/generateService';

type SceneData = { id: number; sourceImageId: string | null; motion: string | null };

export const AnimatedImageToVideo = () => {
  const { generateVideo } = useGenerateService();
  const [isGenerating, setIsGenerating] = useState(false);
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

  const activeScene = scenes.find(s => s.id === activeSceneId) ?? scenes[0]!;

  const addScene = () => {
    const newId = Math.max(...scenes.map(s => s.id)) + 1;
    setScenes(prev => [...prev, { id: newId, sourceImageId: null, motion: null }]);
    setActiveSceneId(newId);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateVideo({
        character_ids: [],
        mode: 'image_to_video',
        orientation,
        quality: quality === 'Balanced' ? 'balance' : 'ultra',
        duration: Number(duration.replace('s', '')),
        ...(audio.script && {
          script: audio.script,
          scene_emotion: audio.sceneEmotion.toLowerCase(),
          voice_type: audio.voiceType.toLowerCase(),
        }),
      });
      toast.success('Scene generation started!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed.';
      const isInsufficient = message.toLowerCase().includes('coin') || message.toLowerCase().includes('credit');
      toast.error(isInsufficient ? `Not enough coins. ${message}` : message);
    } finally {
      setIsGenerating(false);
    }
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
      <div className="grid grid-cols-2 gap-2">
        <GenerateOptionCard
          label="Image"
          sublabel="(Required)"
          height="385px"
          icon={<ImageFrameIcon />}
          isSelected={!!activeScene.sourceImageId}
          onClick={() => {}}
        />
        <GenerateOptionCard
          label="Motion"
          sublabel="(Required)"
          height="385px"
          icon={<MotionIcon />}
          isSelected={!!activeScene.motion}
          onClick={() => {}}
        />
      </div>
      <GenerateOptionCardWide
        label="Creative Input (Advanced)"
        sublabel="Creator Tier Exclusive"
        height="153px"
        icon={<CaptureIcon />}
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
        label="Generate Scene"
        coins={30}
        onClick={handleGenerate}
        isLoading={isGenerating}
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
