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
  const [quality, setQuality] = useState('Balanced');
  const [orientation, setOrientation] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  const [sourceVideo, setSourceVideo] = useState<{ id: string; url: string } | null>(null);
  const [motion, setMotion] = useState<Motion | null>(null);
  const [stars, setStars] = useState<StarCharacter[]>([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [motionModalOpen, setMotionModalOpen] = useState(false);
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [creativeOpen, setCreativeOpen] = useState(false);
  const [creativePrompt, setCreativePrompt] = useState('');
  const [audioOpen, setAudioOpen] = useState(false);
  const [audio, setAudio] = useState<{ script: string; sceneEmotion: Scene; voiceType: string }>({
    script: '',
    sceneEmotion: 'Happy',
    voiceType: 'Aurora',
  });

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
      onComplete: props.onGenerated,
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
