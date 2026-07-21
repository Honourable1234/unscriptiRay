'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateOptionCard } from '@/components/generate/GenerateOptionCard';
import { GenerateOptionCardWide } from '@/components/generate/GenerateOptionCardWide';
import { GenerateVideoControls } from '@/components/generate/GenerateVideoControls';
import { SelectAssetModal } from '@/components/generate/SelectAssetModal';
import { SelectMotionModal } from '@/components/generate/SelectMotionModal';
import { CaptureIcon, MotionIcon, VideoIcon } from '@/components/icons';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useGenerateService } from '@/services/generateService';

export const AnimatedExtendVideo = (props: {
  onGenerated?: () => void;
  onGenerationStart?: (generationId: string) => void;
  onGenerationEnd?: (generationId: string) => void;
}) => {
  const t = useTranslations('AnimatedExtendVideo');
  const { generateVideo } = useGenerateService();
  const { isGenerating, start } = useGenerationRun();
  const [quality, setQuality] = useState('Balanced');
  const [orientation, setOrientation] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  const [sourceVideo, setSourceVideo] = useState<{ id: string; url: string } | null>(null);
  const [motion, setMotion] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [motionModalOpen, setMotionModalOpen] = useState(false);

  const handleGenerate = () => {
    if (!sourceVideo || !motion) {
      return;
    }
    void start(() => generateVideo({
      character_ids: [],
      mode: 'extend_video',
      source_image_id: sourceVideo.id,
      motion: motion.toLowerCase(),
      orientation,
      quality: quality === 'Balanced' ? 'balance' : 'ultra',
      duration: Number(duration.replace('s', '')),
    }), {
      successMessage: t('scene_ready'),
      onComplete: props.onGenerated,
      onStart: props.onGenerationStart,
      onSettled: props.onGenerationEnd,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
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
          selectedName={motion ?? undefined}
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
        audio={false}
        onQualityChange={setQuality}
        onOrientationChange={setOrientation}
        onDurationChange={setDuration}
        onAudioToggle={() => {}}
      />
      <GenerateButton
        label={isGenerating ? t('generating') : t('generate_scene')}
        coins={30}
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!sourceVideo || !motion}
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
            setMotion(m.name);
            setMotionModalOpen(false);
          }}
          onClose={() => setMotionModalOpen(false)}
        />
      )}
    </div>
  );
};
