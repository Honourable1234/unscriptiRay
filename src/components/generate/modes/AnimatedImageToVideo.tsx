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
import { SelectStarModal } from '@/components/generate/SelectStarModal';
import { CaptureIcon, MotionIcon, SelectStarIcon } from '@/components/icons';
import { ImageFrameIcon } from '@/components/icons/ImageFramIcon';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useGenerateService } from '@/services/generateService';

type StarCharacter = { id: string; name: string; image: string };

const MAX_STARS = 4;

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
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [stars, setStars] = useState<StarCharacter[]>([]);
  const [sourceImage, setSourceImage] = useState<{ id: string; url: string } | null>(null);
  const [motion, setMotion] = useState<{ name: string; value: string } | null>(null);

  const isIncomplete = stars.length === 0 || !sourceImage || !motion;

  const handleGenerate = () => {
    if (isIncomplete) {
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
          selectedName={motion?.name}
          onClick={() => setMotionModalOpen(true)}
          onDeselect={() => setMotion(null)}
        />
      </div>
      <GenerateOptionCardWide
        label={t('creative_input_advanced')}
        sublabel={t('creator_tier_exclusive')}
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
            setMotion({ name: m.name, value: m.value });
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
