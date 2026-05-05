'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateOptionCard } from '@/components/generate/GenerateOptionCard';
import { GenerateOptionCardWide } from '@/components/generate/GenerateOptionCardWide';
import { GenerateVideoControls } from '@/components/generate/GenerateVideoControls';
import { CaptureIcon, MotionIcon, VideoIcon } from '@/components/icons';
import { useGenerateService } from '@/services/generateService';

export const AnimatedExtendVideo = () => {
  const { generateVideo } = useGenerateService();
  const [isGenerating, setIsGenerating] = useState(false);
  const [quality, setQuality] = useState('Balanced');
  const [orientation, setOrientation] = useState('16:9');
  const [duration, setDuration] = useState('5s');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateVideo({
        character_ids: [],
        mode: 'extend_video',
        orientation,
        quality: quality === 'Balanced' ? 'balance' : 'ultra',
        duration: Number(duration.replace('s', '')),
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
      <div className="grid grid-cols-2 gap-2">
        <GenerateOptionCard
          label="Video"
          sublabel="(Required)"
          height="385px"
          icon={<VideoIcon />}
          isSelected={false}
          onClick={() => {}}
        />
        <GenerateOptionCard
          label="Motion"
          sublabel="(Required)"
          height="385px"
          icon={<MotionIcon />}
          isSelected={false}
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
        audio={false}
        onQualityChange={setQuality}
        onOrientationChange={setOrientation}
        onDurationChange={setDuration}
        onAudioToggle={() => {}}
      />
      <GenerateButton
        label="Generate Scene"
        coins={30}
        onClick={handleGenerate}
        isLoading={isGenerating}
      />
    </div>
  );
};
