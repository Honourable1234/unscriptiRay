'use client';

import type { Scene } from '@/components/generate/AudioModal';
import type { Motion } from '@/components/generate/SelectMotionModal';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SignUpPromptModal } from '@/components/general/SignUpPromptModal';
import { AudioModal } from '@/components/generate/AudioModal';
import { CreativeInputModal } from '@/components/generate/CreativeInputModal';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateOptionCard } from '@/components/generate/GenerateOptionCard';
import { GenerateOptionCardWide } from '@/components/generate/GenerateOptionCardWide';
import { GenerateVideoControls } from '@/components/generate/GenerateVideoControls';
import { SelectAssetModal } from '@/components/generate/SelectAssetModal';
import { SelectMotionModal } from '@/components/generate/SelectMotionModal';
import { SelectStarModal } from '@/components/generate/SelectStarModal';
import { CaptureIcon, MotionIcon, SelectStarIcon } from '@/components/icons';
import { ImageFrameIcon } from '@/components/icons/ImageFramIcon';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useSessionState } from '@/hooks/useSessionState';
import { useGenerateService } from '@/services/generateService';

type StarCharacter = { id: string; name: string; image: string };

const MAX_STARS = 4;

export const AnimatedImageToVideo = (props: {
  onGenerated?: () => void;
  onGenerationStart?: (generationId: string, orientation: string) => void;
  onGenerationEnd?: (generationId: string) => void;
}) => {
  const t = useTranslations('AnimatedImageToVideo');
  const tPrompt = useTranslations('SignUpPrompts');
  const { generateVideo } = useGenerateService();
  const { isGenerating, needsSignUp, dismissSignUpPrompt, start } = useGenerationRun();
  const [quality, setQuality] = useSessionState('generate:animated_image_to_video:quality', 'Balanced');
  const [orientation, setOrientation] = useSessionState('generate:animated_image_to_video:orientation', '16:9');
  const [duration, setDuration] = useSessionState('generate:animated_image_to_video:duration', '5s');
  const [audioOpen, setAudioOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [motionModalOpen, setMotionModalOpen] = useState(false);
  const [audio, setAudio] = useSessionState<{ script: string; sceneEmotion: Scene; voiceType: string }>('generate:animated_image_to_video:audio', {
    script: '',
    sceneEmotion: 'Happy',
    voiceType: 'Aurora',
  });
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [stars, setStars] = useSessionState<StarCharacter[]>('generate:animated_image_to_video:stars', []);
  const [sourceImage, setSourceImage] = useSessionState<{ id: string; url: string } | null>('generate:animated_image_to_video:source_image', null);
  const [motion, setMotion] = useSessionState<Motion | null>('generate:animated_image_to_video:motion', null);
  const [creativeOpen, setCreativeOpen] = useState(false);
  const [creativePrompt, setCreativePrompt] = useSessionState('generate:animated_image_to_video:creative_prompt', '');

  const isIncomplete = stars.length === 0 || !sourceImage || !motion;

  const resetForm = () => {
    setQuality('Balanced');
    setOrientation('16:9');
    setDuration('5s');
    setAudio({ script: '', sceneEmotion: 'Happy', voiceType: 'Aurora' });
    setStars([]);
    setSourceImage(null);
    setMotion(null);
    setCreativePrompt('');
  };

  const handleGenerate = () => {
    if (stars.length === 0 || !sourceImage || !motion) {
      return;
    }
    void start(() => generateVideo({
      character_ids: stars.map(s => s.id),
      mode: 'image_to_video',
      source_image_id: sourceImage.id,
      motion: motion.value,
      orientation,
      quality: quality === 'Balanced' ? 'balance' : 'ultra',
      duration: Number(duration.replace('s', '')),
      ...(creativePrompt && { advanced_prompt: creativePrompt }),
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
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <GenerateOptionCard
          label={t('select_star')}
          sublabel={t('required')}
          icon={<SelectStarIcon />}
          isSelected={stars.length > 0}
          selectedImage={stars[0]?.image}
          selectedName={stars.length > 1 ? t('stars_count', { count: stars.length }) : stars[0]?.name}
          badge={stars.length > 1 ? `+${stars.length - 1}` : undefined}
          onClick={() => setStarModalOpen(true)}
          onDeselect={() => setStars([])}
        />
        <GenerateOptionCard
          label={t('image')}
          sublabel={t('required')}
          icon={<ImageFrameIcon />}
          isSelected={!!sourceImage}
          selectedImage={sourceImage?.url}
          selectedName={t('select_image')}
          onClick={() => setImageModalOpen(true)}
          onDeselect={() => setSourceImage(null)}
        />
        <GenerateOptionCard
          label={t('motion')}
          sublabel={t('required')}
          icon={<MotionIcon />}
          isSelected={!!motion}
          selectedImage={motion?.imageUrl ?? undefined}
          selectedName={motion?.name}
          onClick={() => setMotionModalOpen(true)}
          onDeselect={() => setMotion(null)}
        />
      </div>
      <GenerateOptionCardWide
        label={t('creative_input_advanced')}
        sublabel={t('creator_tier_exclusive')}
        icon={<CaptureIcon />}
        isSelected={!!creativePrompt}
        selectedName={creativePrompt || undefined}
        onClick={() => setCreativeOpen(true)}
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
        disabled={isIncomplete}
      />
      {imageModalOpen && (
        <SelectAssetModal
          title={t('select_image')}
          filter="image"
          onSelect={(asset) => {
            setSourceImage({ id: asset.id, url: asset.url });
            setImageModalOpen(false);
          }}
          onClose={() => setImageModalOpen(false)}
        />
      )}
      {starModalOpen && (
        <SelectStarModal
          multiple
          selected={stars}
          max={MAX_STARS}
          onConfirm={setStars}
          onClose={() => setStarModalOpen(false)}
        />
      )}
      {motionModalOpen && (
        <SelectMotionModal
          onSelect={(m) => {
            setMotion(m);
            setMotionModalOpen(false);
          }}
          onClose={() => setMotionModalOpen(false)}
        />
      )}
      {creativeOpen && (
        <CreativeInputModal
          value={creativePrompt}
          characterId={stars[0]?.id}
          onSave={value => setCreativePrompt(value.trim())}
          onClose={() => setCreativeOpen(false)}
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
      {needsSignUp && (
        <SignUpPromptModal
          description={tPrompt('generate_scenes')}
          onClose={dismissSignUpPrompt}
        />
      )}
    </div>
  );
};
