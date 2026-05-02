'use client';

import type { Scene } from '@/components/generate/AudioModal';
import type { SelectedVoice } from '@/components/generate/VoiceModal';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateOptionCard } from '@/components/generate/GenerateOptionCard';
import { GenerateOptionCardWide } from '@/components/generate/GenerateOptionCardWide';
import { ScriptModal } from '@/components/generate/ScriptModal';
import { VoiceIcon } from '@/components/icons';
import { ImageFrameIcon } from '@/components/icons/ImageFramIcon';
import { useGenerateService } from '@/services/generateService';
import { VoiceModal } from '../VoiceModal';

const sceneEmotions: Scene[] = ['Happy', 'Natural', 'Sad', 'Angry', 'Fearful', 'Disgusted', 'Surprised'];

export const AnimatedTalking = () => {
  const { generateSpeech, pollGenerationStatus } = useGenerateService();
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [voice, setVoice] = useState<SelectedVoice | null>(null);
  const [script, setScript] = useState('');
  const [sceneEmotion, setSceneEmotion] = useState<Scene>('Happy');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopPollRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stopPollRef.current?.();
    };
  }, []);

  const handlePlayVoice = () => {
    if (!voice?.sampleUrl) {
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(voice.sampleUrl);
    audioRef.current = audio;
    audio.play().catch(() => {});
  };

  const handleGenerate = async () => {
    stopPollRef.current?.();
    setIsGenerating(true);
    try {
      const res = await generateSpeech({
        character_ids: ['bd3cc745-af00-4138-8098-5a67a6bc7153'],
        mode: 'talking',
        orientation: '16:9',
        quality: 'balance',
        duration: 5,
        script,
        scene_emotion: sceneEmotion.toLowerCase(),
        voice_type: voice?.shortName ?? '',
      });
      toast.info('Generation started, processing...');
      stopPollRef.current = pollGenerationStatus(
        res.content.generation_id,
        () => {
          setIsGenerating(false);
          toast.success('Scene ready!');
        },
        (errorMsg) => {
          setIsGenerating(false);
          toast.error(errorMsg);
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed.';
      const isInsufficient = message.toLowerCase().includes('coin') || message.toLowerCase().includes('credit');
      toast.error(isInsufficient ? `Not enough coins. ${message}` : message);
      setIsGenerating(false);
    }
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
          isSelected={!!voice}
          selectedName={voice?.localName}
          onClick={() => setVoiceModalOpen(true)}
          onDeselect={() => setVoice(null)}
          onPlay={voice ? handlePlayVoice : undefined}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {sceneEmotions.map(emotion => (
          <button
            key={emotion}
            onClick={() => setSceneEmotion(emotion)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${sceneEmotion === emotion ? 'bg-primary-100 text-white' : 'bg-black-40 text-white-75 hover:bg-black-60'}`}
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
        isSelected={!!script}
        onClick={() => setScriptModalOpen(true)}
      />

      <GenerateButton
        label={isGenerating ? 'Generating...' : 'Generate Scene'}
        coins={30}
        onClick={handleGenerate}
        isLoading={isGenerating}
      />

      {voiceModalOpen && (
        <VoiceModal
          selected={voice?.shortName ?? ''}
          onSelect={(v) => {
            setVoice(v);
            setVoiceModalOpen(false);
          }}
          onClose={() => setVoiceModalOpen(false)}
        />
      )}

      {scriptModalOpen && (
        <ScriptModal
          script={script}
          onSave={setScript}
          onClose={() => setScriptModalOpen(false)}
        />
      )}
    </div>
  );
};
