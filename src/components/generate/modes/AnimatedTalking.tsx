'use client';

import type { Scene } from '@/components/generate/AudioModal';
import type { SelectedVoice } from '@/components/generate/VoiceModal';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { SignUpPromptModal } from '@/components/general/SignUpPromptModal';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateOptionCard } from '@/components/generate/GenerateOptionCard';
import { GenerateOptionCardWide } from '@/components/generate/GenerateOptionCardWide';
import { ScriptModal } from '@/components/generate/ScriptModal';
import { SelectAssetModal } from '@/components/generate/SelectAssetModal';
import { SelectStarModal } from '@/components/generate/SelectStarModal';
import { SelectStarIcon, VoiceIcon } from '@/components/icons';
import { ImageFrameIcon } from '@/components/icons/ImageFramIcon';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useSessionState } from '@/hooks/useSessionState';
import { useGenerateService } from '@/services/generateService';
import { VoiceModal } from '../VoiceModal';

type StarCharacter = { id: string; name: string; image: string };

const MAX_STARS = 4;

const sceneEmotions: Scene[] = ['Happy', 'Natural', 'Sad', 'Angry', 'Fearful', 'Disgusted', 'Surprised'];

export const AnimatedTalking = (props: {
  onGenerated?: () => void;
  onGenerationStart?: (generationId: string, orientation: string) => void;
  onGenerationEnd?: (generationId: string) => void;
}) => {
  const t = useTranslations('AnimatedTalking');
  const tPrompt = useTranslations('SignUpPrompts');
  const { generateSpeech } = useGenerateService();
  const { isGenerating, needsSignUp, dismissSignUpPrompt, start } = useGenerationRun();
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [stars, setStars] = useSessionState<StarCharacter[]>('generate:animated_talking:stars', []);
  const [voice, setVoice] = useSessionState<SelectedVoice | null>('generate:animated_talking:voice', null);
  const [source, setSource] = useSessionState<{ id: string; url: string; type: string } | null>('generate:animated_talking:source', null);
  const [script, setScript] = useSessionState('generate:animated_talking:script', '');
  const [sceneEmotion, setSceneEmotion] = useSessionState<Scene>('generate:animated_talking:scene_emotion', 'Happy');
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

  const resetForm = () => {
    setStars([]);
    setVoice(null);
    setSource(null);
    setScript('');
    setSceneEmotion('Happy');
  };

  const handleGenerate = () => {
    if (stars.length === 0 || !source || !voice || !script.trim()) {
      return;
    }
    void start(() => generateSpeech({
      character_ids: stars.map(s => s.id),
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
      onComplete: () => {
        props.onGenerated?.();
        resetForm();
      },
      onStart: id => props.onGenerationStart?.(id, '16:9'),
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
          label={t('image_video')}
          sublabel={t('required')}
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
        disabled={stars.length === 0 || !source || !voice || !script.trim()}
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

      {starModalOpen && (
        <SelectStarModal
          multiple
          selected={stars}
          max={MAX_STARS}
          onConfirm={setStars}
          onClose={() => setStarModalOpen(false)}
        />
      )}

      {needsSignUp && (
        <SignUpPromptModal
          description={tPrompt('generate_scenes')}
          onClose={dismissSignUpPrompt}
        />
      )}
    </div>
  );
};
