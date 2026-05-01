'use client';

import type { Scene } from '@/components/generate/AudioModal';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateOptionCard } from '@/components/generate/GenerateOptionCard';
import { GenerateOptionCardWide } from '@/components/generate/GenerateOptionCardWide';
import { VoiceIcon } from '@/components/icons';
import { ImageFrameIcon } from '@/components/icons/ImageFramIcon';
import { useGenerateService } from '@/services/generateService';
import { VoiceModal } from '../VoiceModal';

const sceneEmotions: Scene[] = ['Happy', 'Natural', 'Sad', 'Angry', 'Fearful', 'Disgusted', 'Surprised'];

export const AnimatedTalking = () => {
  const { generateSpeech } = useGenerateService();
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioOpen, setAudioOpen] = useState(false);
  const [audio, setAudio] = useState<{ script: string; sceneEmotion: Scene; voiceType: string }>({
    script: '',
    sceneEmotion: 'Happy',
    voiceType: 'Aurora',
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    console.warn(audio);
    try {
      await generateSpeech({
        character_ids: ['bd3cc745-af00-4138-8098-5a67a6bc7153'],
        mode: 'talking',
        orientation: '16:9',
        quality: 'balance',
        duration: 5,
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

  const handleSelectVoice = (voice: string) => {
    setAudio({
      ...audio,
      voiceType: voice,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <GenerateOptionCard
          label="Image / Video"
          sublabel="(Required)"
          height="385px"
          icon={<ImageFrameIcon />}
          isSelected={false}
          onClick={() => {}}
        />
        <GenerateOptionCard
          label="Voice"
          sublabel="(Required)"
          height="385px"
          icon={<VoiceIcon />}
          isSelected={true}
          onClick={() => setAudioOpen(true)}
          selectedName="testing"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {sceneEmotions.map(emotion => (
          <button
            key={emotion}
            onClick={() => setAudio(prev => ({ ...prev, sceneEmotion: emotion }))}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${audio.sceneEmotion === emotion ? 'bg-primary-100 text-white' : 'bg-black-40 text-white-75 hover:bg-black-60'}`}
          >
            {emotion}
          </button>
        ))}
      </div>
      <GenerateOptionCardWide
        label="Audio Script"
        sublabel="(Required)"
        height="153px"
        icon={<VoiceIcon />}
        isSelected={!!audio.script}
        onClick={() => setAudioOpen(true)}
      />
      <GenerateButton
        label="Generate Scene"
        coins={30}
        onClick={handleGenerate}
        isLoading={isGenerating}
      />
      {audioOpen && (
        <VoiceModal
          selected={audio.voiceType}
          onSelect={handleSelectVoice}
          onClose={() => setAudioOpen(false)}
        />
      )}
    </div>
  );
};
