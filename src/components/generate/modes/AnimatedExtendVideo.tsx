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
import { CaptureIcon, MotionIcon, SelectStarIcon, VideoIcon } from '@/components/icons';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useSessionState } from '@/hooks/useSessionState';
import { useGenerateService } from '@/services/generateService';

type StarCharacter = { id: string; name: string; image: string };

const MAX_STARS = 4;

export const AnimatedExtendVideo = (props: {
  onGenerated?: () => void;
  onGenerationStart?: (generationId: string, orientation: string) => void;
  onGenerationEnd?: (generationId: string) => void;
}) => {
  const t = useTranslations('AnimatedExtendVideo');
  const tPrompt = useTranslations('SignUpPrompts');
  const { generateVideo } = useGenerateService();
  const { isGenerating, needsSignUp, dismissSignUpPrompt, start } = useGenerationRun();
  const [quality, setQuality] = useSessionState('generate:animated_extend_video:quality', 'Balanced');
  const [orientation, setOrientation] = useSessionState('generate:animated_extend_video:orientation', '16:9');
  const [duration, setDuration] = useSessionState('generate:animated_extend_video:duration', '5s');
  const [sourceVideo, setSourceVideo] = useSessionState<{ id: string; url: string } | null>('generate:animated_extend_video:source_video', null);
  const [motion, setMotion] = useSessionState<Motion | null>('generate:animated_extend_video:motion', null);
  const [stars, setStars] = useSessionState<StarCharacter[]>('generate:animated_extend_video:stars', []);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [motionModalOpen, setMotionModalOpen] = useState(false);
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [creativeOpen, setCreativeOpen] = useState(false);
  const [creativePrompt, setCreativePrompt] = useSessionState('generate:animated_extend_video:creative_prompt', '');
  const [audioOpen, setAudioOpen] = useState(false);
  const [audio, setAudio] = useSessionState<{ script: string; sceneEmotion: Scene; voiceType: string }>('generate:animated_extend_video:audio', {
    script: '',
    sceneEmotion: 'Happy',
    voiceType: 'Aurora',
  });

  const resetForm = () => {
    setQuality('Balanced');
    setOrientation('16:9');
    setDuration('5s');
    setSourceVideo(null);
    setMotion(null);
    setStars([]);
    setCreativePrompt('');
    setAudio({ script: '', sceneEmotion: 'Happy', voiceType: 'Aurora' });
  };

  const handleGenerate = () => {
    if (stars.length === 0 || !sourceVideo || !motion) {
      return;
    }
    void start(() => generateVideo({
      character_ids: stars.map(s => s.id),
      mode: 'extend_video',
      source_image_id: sourceVideo.id,
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
          label={t('video')}
          sublabel={t('required')}
          icon={<VideoIcon />}
          isSelected={!!sourceVideo}
          selectedName={t('select_video')}
          onClick={() => setVideoModalOpen(true)}
          onDeselect={() => setSourceVideo(null)}
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
        disabled={stars.length === 0 || !sourceVideo || !motion}
      />
      {videoModalOpen && (
        <SelectAssetModal
          title={t('select_video')}
          filter="video"
          onSelect={(asset) => {
            setSourceVideo({ id: asset.id, url: asset.url });
            setVideoModalOpen(false);
          }}
          onClose={() => setVideoModalOpen(false)}
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
          onSave={value => setCreativePrompt(value.trim())}
          onClose={() => setCreativeOpen(false)}
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
