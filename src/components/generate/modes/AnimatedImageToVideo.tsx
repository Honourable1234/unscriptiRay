'use client';

import type { Scene } from '@/components/generate/AudioModal';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AudioModal } from '@/components/generate/AudioModal';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateOptionCard } from '@/components/generate/GenerateOptionCard';
import { GenerateOptionCardWide } from '@/components/generate/GenerateOptionCardWide';
import { GenerateVideoControls } from '@/components/generate/GenerateVideoControls';
import { SelectAssetModal } from '@/components/generate/SelectAssetModal';
import { SelectMotionModal } from '@/components/generate/SelectMotionModal';
import { CaptureIcon, MotionIcon } from '@/components/icons';
import { ImageFrameIcon } from '@/components/icons/ImageFramIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useGenerateService } from '@/services/generateService';

type SceneData = { id: number; sourceImageId: string | null; sourceImageUrl: string | null; motion: string | null };

export const AnimatedImageToVideo = (props: {
  onGenerated?: () => void;
  onGenerationStart?: (generationId: string) => void;
  onGenerationEnd?: (generationId: string) => void;
}) => {
  const t = useTranslations('AnimatedImageToVideo');
  const { generateVideo } = useGenerateService();
  const { isGenerating, start } = useGenerationRun();
  const [quality, setQuality] = useState('Balanced');
  const [orientation, setOrientation] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  const [audioOpen, setAudioOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [motionModalOpen, setMotionModalOpen] = useState(false);
  const [audio, setAudio] = useState<{ script: string; sceneEmotion: Scene; voiceType: string }>({
    script: '',
    sceneEmotion: 'Happy',
    voiceType: 'Aurora',
  });
  const [scenes, setScenes] = useState<SceneData[]>([{ id: 1, sourceImageId: null, sourceImageUrl: null, motion: null }]);
  const [activeSceneId, setActiveSceneId] = useState(1);

  const activeScene = scenes.find(s => s.id === activeSceneId) ?? scenes[0]!;

  const updateActiveScene = (patch: Partial<SceneData>) => {
    setScenes(prev => prev.map(s => (s.id === activeSceneId ? { ...s, ...patch } : s)));
  };

  const addScene = () => {
    const newId = Math.max(...scenes.map(s => s.id)) + 1;
    setScenes(prev => [...prev, { id: newId, sourceImageId: null, sourceImageUrl: null, motion: null }]);
    setActiveSceneId(newId);
  };

  const handleGenerate = () => {
    if (!activeScene.sourceImageId || !activeScene.motion) {
      return;
    }
    void start(() => generateVideo({
      character_ids: [],
      mode: 'image_to_video',
      source_image_id: activeScene.sourceImageId!,
      motion: activeScene.motion!.toLowerCase(),
      orientation,
      quality: quality === 'Balanced' ? 'balance' : 'ultra',
      duration: Number(duration.replace('s', '')),
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
      <div className="flex items-center justify-center gap-2">
        {scenes.map(scene => (
          <button
            key={scene.id}
            onClick={() => setActiveSceneId(scene.id)}
            className={`cursor-pointer rounded-lg p-3 text-xs font-medium transition-colors ${activeScene.id === scene.id ? 'bg-primary-100/10 text-primary-100' : 'text-white hover:bg-black-40'}`}
          >
            {t('scene_label', { id: scene.id })}
          </button>
        ))}
        <button
          onClick={addScene}
          className="flex cursor-pointer items-center gap-1 rounded-lg p-3 text-xs font-medium text-white transition-all hover:scale-105"
        >
          <PlusIcon />
          {t('add')}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <GenerateOptionCard
          label={t('image')}
          sublabel={t('required')}
          height="385px"
          icon={<ImageFrameIcon />}
          isSelected={!!activeScene.sourceImageId}
          selectedImage={activeScene.sourceImageUrl ?? undefined}
          selectedName={t('select_image')}
          onClick={() => setImageModalOpen(true)}
          onDeselect={() => updateActiveScene({ sourceImageId: null, sourceImageUrl: null })}
        />
        <GenerateOptionCard
          label={t('motion')}
          sublabel={t('required')}
          height="385px"
          icon={<MotionIcon />}
          isSelected={!!activeScene.motion}
          selectedName={activeScene.motion ?? undefined}
          onClick={() => setMotionModalOpen(true)}
          onDeselect={() => updateActiveScene({ motion: null })}
        />
      </div>
      <GenerateOptionCardWide
        label={t('creative_input_advanced')}
        sublabel={t('creator_tier_exclusive')}
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
        label={isGenerating ? t('generating') : t('generate_scene')}
        coins={30}
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!activeScene.sourceImageId || !activeScene.motion}
      />
      {imageModalOpen && (
        <SelectAssetModal
          title={t('select_image')}
          filter="image"
          onSelect={(asset) => {
            updateActiveScene({ sourceImageId: asset.id, sourceImageUrl: asset.url });
            setImageModalOpen(false);
          }}
          onClose={() => setImageModalOpen(false)}
        />
      )}
      {motionModalOpen && (
        <SelectMotionModal
          onSelect={(m) => {
            updateActiveScene({ motion: m.name });
            setMotionModalOpen(false);
          }}
          onClose={() => setMotionModalOpen(false)}
        />
      )}
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
