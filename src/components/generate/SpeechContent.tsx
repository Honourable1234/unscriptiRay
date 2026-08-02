'use client';

import type { SelectedVoice } from './VoiceModal';
import type { Asset } from '@/services/generateService';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { VoiceIcon } from '@/components/icons';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useGenerateService } from '@/services/generateService';
import { GenerateButton } from './GenerateButton';
import { GenerateOptionCard } from './GenerateOptionCard';
import { GenerateOptionCardWide } from './GenerateOptionCardWide';
import { ScriptModal } from './ScriptModal';
import { VoiceModal } from './VoiceModal';

type Scene = 'Happy' | 'Natural' | 'Sad' | 'Angry' | 'Fearful' | 'Disgusted' | 'Surprised';
const scenes: Scene[] = ['Happy', 'Natural', 'Sad', 'Angry', 'Fearful', 'Disgusted', 'Surprised'];

export const SpeechContent = (props: { asset: Asset | null; onSuccess?: () => void }) => {
  const t = useTranslations('SpeechContent');
  const { generateSpeech } = useGenerateService();
  const { isGenerating, start } = useGenerationRun();
  // The speech endpoint rejects a body without these, so they come from the
  // settings the source asset was generated with.
  const settings = props.asset?.settings;
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [voice, setVoice] = useState<SelectedVoice | null>(null);
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
    if (!voice) {
      toast.error(t('select_voice_first'));
      return;
    }
    if (!script.trim()) {
      toast.error(t('enter_script_first'));
      return;
    }
    void start(() => generateSpeech({
      character_ids: settings?.characterId ? [settings.characterId] : [],
      source_image_id: props.asset?.id ?? '',
      mode: 'talking',
      orientation: props.asset?.orientation ?? '16:9',
      quality: settings?.quality ?? 'balance',
      duration: settings?.duration ?? 5,
      voice_type: voice.shortName,
      script,
      scene_emotion: sceneEmotion.toLowerCase(),
    }), { successMessage: t('scene_ready'), onComplete: props.onSuccess });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Voice */}
      <GenerateOptionCard
        label={t('voice')}
        sublabel={t('required')}
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
        <span className="text-sm font-medium text-white">{t('scene_label')}</span>
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
        label={t('audio_script')}
        sublabel={t('required')}
        height="105px"
        icon={<VoiceIcon />}
        isSelected={!!script}
        selectedName={script}
        onClick={() => setScriptModalOpen(true)}
      />

      <GenerateButton
        label={isGenerating ? t('generating') : t('generate_speech')}
        coins={30}
        onClick={handleGenerate}
        isLoading={isGenerating || !props.asset}
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
