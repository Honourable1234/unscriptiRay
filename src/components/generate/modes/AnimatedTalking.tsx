'use client';

import type { Scene } from '@/components/generate/AudioModal';
import type { SelectedVoice } from '@/components/generate/VoiceModal';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateOptionCard } from '@/components/generate/GenerateOptionCard';
import { GenerateOptionCardWide } from '@/components/generate/GenerateOptionCardWide';
import { ScriptModal } from '@/components/generate/ScriptModal';
import { SelectAssetModal } from '@/components/generate/SelectAssetModal';
import { VoiceIcon } from '@/components/icons';
import { ImageFrameIcon } from '@/components/icons/ImageFramIcon';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useGenerateService } from '@/services/generateService';
import { VoiceModal } from '../VoiceModal';

const sceneEmotions: Scene[] = ['Happy', 'Natural', 'Sad', 'Angry', 'Fearful', 'Disgusted', 'Surprised'];

export const AnimatedTalking = (props: {
  onGenerated?: () => void;
  onGenerationStart?: (generationId: string) => void;
  onGenerationEnd?: (generationId: string) => void;
}) => {
  const t = useTranslations('AnimatedTalking');
  const { generateSpeech } = useGenerateService();
  const { isGenerating, start } = useGenerationRun();
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [voice, setVoice] = useState<SelectedVoice | null>(null);
  const [source, setSource] = useState<{ id: string; url: string; type: string } | null>(null);
  const [script, setScript] = useState('');
  const [sceneEmotion, setSceneEmotion] = useState<Scene>('Happy');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayVoice = () => {
    if (!voice?.sampleUrl) {
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(voice.sampleUrl);
    audioRef.current = audio;
    audio.play().catch(() => {});
  };

  const handleGenerate = () => {
    if (!source || !voice || !script.trim()) {
      return;
    }
    void start(() => generateSpeech({
      character_ids: [],
      mode: 'talking',
      source_image_id: source.id,
      orientation: '16:9',
      quality: 'balance',
      duration: 5,
      script,
      scene_emotion: sceneEmotion.toLowerCase(),
      voice_type: voice.shortName,
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
          label={t('image_video')}
          sublabel={t('required')}
          height="385px"
          icon={<ImageFrameIcon />}
          isSelected={!!source}
          selectedImage={source?.type === 'image' ? source.url : undefined}
          selectedName={source ? t('select_image_video') : undefined}
          onClick={() => setSourceModalOpen(true)}
          onDeselect={() => setSource(null)}
        />
        <GenerateOptionCard
          label={t('voice')}
          sublabel={t('required')}
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
        label={t('audio_script')}
        sublabel={t('required')}
        height="153px"
        icon={<VoiceIcon />}
        isSelected={!!script}
        selectedName={script || undefined}
        onClick={() => setScriptModalOpen(true)}
      />

      <GenerateButton
        label={isGenerating ? t('generating') : t('generate_scene')}
        coins={30}
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!source || !voice || !script.trim()}
      />

      {sourceModalOpen && (
        <SelectAssetModal
          title={t('select_image_video')}
          filter="all"
          onSelect={(asset) => {
            setSource(asset);
            setSourceModalOpen(false);
          }}
          onClose={() => setSourceModalOpen(false)}
        />
      )}

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
