'use client';

import type { Scene } from './AudioModal';
import type { Motion } from './SelectMotionModal';
import type { Asset } from '@/services/generateService';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { CaptureIcon, MotionIcon, SelectStarIcon } from '@/components/icons';
import { useAssetStar } from '@/hooks/useAssetStar';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { settingLabel, useGenerateService } from '@/services/generateService';
import { AudioModal } from './AudioModal';
import { CreativeInputModal } from './CreativeInputModal';
import { GenerateButton } from './GenerateButton';
import { GenerateOptionCard } from './GenerateOptionCard';
import { GenerateOptionCardWide } from './GenerateOptionCardWide';
import { GenerateVideoControls } from './GenerateVideoControls';
import { SelectMotionModal } from './SelectMotionModal';
import { SelectStarModal } from './SelectStarModal';

type AudioData = { script: string; sceneEmotion: Scene; voiceType: string };

export const VideoContent = (props: { asset: Asset | null; onSuccess?: () => void }) => {
  const t = useTranslations('VideoContent');
  const { generateVideo } = useGenerateService();
  const { isGenerating, start } = useGenerationRun();
  // The modal opens on the settings the source asset was generated with, so the
  // video starts from the current scene instead of a blank form.
  const settings = props.asset?.settings;
  const [quality, setQuality] = useState(settings?.quality === 'ultra' ? 'Ultra' : 'Balanced');
  const [orientation, setOrientation] = useState(props.asset?.orientation ?? '16:9');
  const [duration, setDuration] = useState(settings?.duration ? `${settings.duration}s` : '5s');
  const [starCharacter, setStarCharacter] = useAssetStar(settings?.characterId ?? null);
  const [motion, setMotion] = useState<Motion | null>(() =>
    settings?.motion ? { id: '', name: settingLabel(settings.motion), value: settings.motion, imageUrl: null } : null);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [creativePrompt, setCreativePrompt] = useState(settings?.advancedPrompt ?? '');
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [motionModalOpen, setMotionModalOpen] = useState(false);
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [creativeModalOpen, setCreativeModalOpen] = useState(false);

  const handleGenerate = () => {
    if (!starCharacter) {
      toast.error(t('select_star_first'));
      return;
    }
    void start(() => generateVideo({
      source_image_id: props.asset?.id ?? '',
      character_ids: [starCharacter.id],
      mode: 'image_to_video',
      motion: motion?.value,
      quality: quality === 'Balanced' ? 'balance' : 'ultra',
      orientation,
      duration: Number.parseInt(duration, 10),
      ...(creativePrompt && { advanced_prompt: creativePrompt }),
      ...(audioData && {
        voice_type: audioData.voiceType,
        script: audioData.script,
        scene_emotion: audioData.sceneEmotion.toLowerCase(),
      }),
    }), { successMessage: t('video_ready'), onComplete: props.onSuccess });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3">
        <GenerateOptionCard
          label={t('select_star')}
          sublabel={t('required')}
          height="200px"
          icon={<SelectStarIcon />}
          isSelected={!!starCharacter}
          selectedImage={starCharacter?.image}
          selectedName={starCharacter?.name}
          onClick={() => setStarModalOpen(true)}
          onDeselect={() => setStarCharacter(null)}
        />
        <GenerateOptionCard
          label={t('motion')}
          sublabel={t('required')}
          height="200px"
          icon={<MotionIcon />}
          isSelected={!!motion}
          selectedImage={motion?.imageUrl ?? undefined}
          selectedName={motion?.name}
          onClick={() => setMotionModalOpen(true)}
          onDeselect={() => setMotion(null)}
        />
      </div>

      <GenerateOptionCardWide
        label={t('creative_input')}
        sublabel={t('creator_tier')}
        height="107px"
        icon={<CaptureIcon />}
        isSelected={!!creativePrompt}
        selectedName={creativePrompt || undefined}
        onClick={() => setCreativeModalOpen(true)}
      />

      <GenerateVideoControls
        quality={quality}
        orientation={orientation}
        duration={duration}
        audio={!!audioData}
        onQualityChange={setQuality}
        onOrientationChange={setOrientation}
        onDurationChange={setDuration}
        onAudioToggle={() => setAudioModalOpen(true)}
      />

      <GenerateButton
        label={isGenerating ? t('generating') : t('generate_video')}
        coins={30}
        onClick={handleGenerate}
        isLoading={isGenerating || !props.asset}
        py="py-2"
        px="px-4"
        textSize="text-xs"
      />

      {motionModalOpen && (
        <SelectMotionModal
          onSelect={(m) => {
            setMotion(m);
            setMotionModalOpen(false);
          }}
          onClose={() => setMotionModalOpen(false)}
        />
      )}

      {starModalOpen && (
        <SelectStarModal
          onSelect={(character) => {
            setStarCharacter(character);
            setStarModalOpen(false);
          }}
          onClose={() => setStarModalOpen(false)}
        />
      )}

      {creativeModalOpen && (
        <CreativeInputModal
          value={creativePrompt}
          characterId={starCharacter?.id}
          onSave={value => setCreativePrompt(value.trim())}
          onClose={() => setCreativeModalOpen(false)}
        />
      )}

      {audioModalOpen && (
        <AudioModal
          script={audioData?.script ?? ''}
          sceneEmotion={audioData?.sceneEmotion ?? 'Happy'}
          voiceType={audioData?.voiceType ?? ''}
          onSave={(values) => {
            setAudioData(values);
            setAudioModalOpen(false);
          }}
          onClose={() => setAudioModalOpen(false)}
        />
      )}
    </div>
  );
};
