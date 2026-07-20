'use client';

import type { Scene } from './AudioModal';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { CaptureIcon, MotionIcon, SelectStarIcon } from '@/components/icons';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useGenerateService } from '@/services/generateService';
import { AudioModal } from './AudioModal';
import { GenerateButton } from './GenerateButton';
import { GenerateOptionCard } from './GenerateOptionCard';
import { GenerateOptionCardWide } from './GenerateOptionCardWide';
import { GenerateVideoControls } from './GenerateVideoControls';
import { SelectMotionModal } from './SelectMotionModal';
import { SelectStarModal } from './SelectStarModal';

type StarCharacter = { id: string; name: string; image: string };
type MotionItem = { id: string; name: string };
type AudioData = { script: string; sceneEmotion: Scene; voiceType: string };

export const VideoContent = (props: { assetId: string; onSuccess?: () => void }) => {
  const { generateVideo } = useGenerateService();
  const { isGenerating, start } = useGenerationRun();
  const [quality, setQuality] = useState('Balanced');
  const [orientation, setOrientation] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  const [starCharacter, setStarCharacter] = useState<StarCharacter | null>(null);
  const [motion, setMotion] = useState<MotionItem | null>(null);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [motionModalOpen, setMotionModalOpen] = useState(false);
  const [audioModalOpen, setAudioModalOpen] = useState(false);

  const handleGenerate = () => {
    if (!starCharacter) {
      toast.error('Please select a star first.');
      return;
    }
    void start(() => generateVideo({
      source_image_id: props.assetId,
      character_ids: [starCharacter.id],
      mode: 'image_to_video',
      motion: motion?.name.toLowerCase(),
      quality: quality === 'Balanced' ? 'balance' : 'ultra',
      orientation,
      duration: Number.parseInt(duration, 10),
      ...(audioData && {
        voice_type: audioData.voiceType,
        script: audioData.script,
        scene_emotion: audioData.sceneEmotion.toLowerCase(),
      }),
    }), { successMessage: 'Video ready!', onComplete: props.onSuccess });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3">
        <GenerateOptionCard
          label="Select Star"
          sublabel="(Required)"
          height="200px"
          icon={<SelectStarIcon />}
          isSelected={!!starCharacter}
          selectedImage={starCharacter?.image}
          selectedName={starCharacter?.name}
          onClick={() => setStarModalOpen(true)}
          onDeselect={() => setStarCharacter(null)}
        />
        <GenerateOptionCard
          label="Motion"
          sublabel="(Required)"
          height="200px"
          icon={<MotionIcon />}
          isSelected={!!motion}
          selectedName={motion?.name}
          onClick={() => setMotionModalOpen(true)}
          onDeselect={() => setMotion(null)}
        />
      </div>

      <GenerateOptionCardWide
        label="Creative Input"
        sublabel="Creator Tier"
        height="107px"
        icon={<CaptureIcon />}
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
        label={isGenerating ? 'Generating...' : 'Generate Video'}
        coins={30}
        onClick={handleGenerate}
        isLoading={isGenerating || !props.assetId}
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
