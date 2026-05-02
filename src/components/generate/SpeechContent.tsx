'use client';

import type { SelectedVoice } from './VoiceModal';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { VoiceIcon } from '@/components/icons';
import { useGenerateService } from '@/services/generateService';
import { GenerateButton } from './GenerateButton';
import { GenerateOptionCard } from './GenerateOptionCard';
import { GenerateOptionCardWide } from './GenerateOptionCardWide';
import { ScriptModal } from './ScriptModal';
import { VoiceModal } from './VoiceModal';

type Scene = 'Happy' | 'Natural' | 'Sad' | 'Angry' | 'Fearful' | 'Disgusted' | 'Surprised';
const scenes: Scene[] = ['Happy', 'Natural', 'Sad', 'Angry', 'Fearful', 'Disgusted', 'Surprised'];

export const SpeechContent = (props: { assetId: string; onSuccess?: () => void }) => {
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
    audioRef.current?.pause();
    const audio = new Audio(voice.sampleUrl);
    audioRef.current = audio;
    audio.play().catch(() => {});
  };

  const handleGenerate = async () => {
    if (!voice) {
      toast.error('Please select a voice first.');
      return;
    }
    if (!script.trim()) {
      toast.error('Please enter an audio script first.');
      return;
    }
    stopPollRef.current?.();
    setIsGenerating(true);
    try {
      const res = await generateSpeech({
        source_image_id: props.assetId,
        mode: 'talking',
        voice_type: voice.shortName,
        script,
        scene_emotion: sceneEmotion.toLowerCase(),
      });
      toast.info('Generation started, processing...');
      stopPollRef.current = pollGenerationStatus(
        res.content.generation_id,
        () => {
          setIsGenerating(false);
          toast.success('Scene ready!');
          props.onSuccess?.();
        },
        (errorMsg) => {
          setIsGenerating(false);
          toast.error(errorMsg);
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed.';
      toast.error(message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Voice */}
      <GenerateOptionCard
        label="Voice"
        sublabel="(Required)"
        icon={<VoiceIcon />}
        isSelected={!!voice}
        selectedName={voice?.localName}
        onClick={() => setVoiceModalOpen(true)}
        onDeselect={() => setVoice(null)}
        onPlay={voice ? handlePlayVoice : undefined}
        height="180px"
      />

      {/* Scene emotion */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-white">Scene emotion</span>
        <div className="flex flex-wrap gap-1.5">
          {scenes.map(s => (
            <button
              key={s}
              onClick={() => setSceneEmotion(s)}
              className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${sceneEmotion === s ? 'bg-primary-100 text-white' : 'bg-black-40 text-white-75 hover:border-white-75'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Script */}
      <GenerateOptionCardWide
        label="Audio Script"
        sublabel="(Required)"
        height="105px"
        icon={<VoiceIcon />}
        isSelected={!!script}
        onClick={() => setScriptModalOpen(true)}
      />

      <GenerateButton
        label={isGenerating ? 'Generating...' : 'Generate Speech'}
        coins={30}
        onClick={handleGenerate}
        isLoading={isGenerating || !props.assetId}
        py="py-2"
        px="px-4"
        textSize="text-xs"
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
