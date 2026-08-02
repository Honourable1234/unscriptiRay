'use client';

import type { Scene } from './AudioModal';
import type { Asset } from '@/services/generateService';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAssetStar } from '@/hooks/useAssetStar';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { settingLabel, useGenerateService } from '@/services/generateService';
import { AudioModal } from './AudioModal';
import { GenerateButton } from './GenerateButton';
import { GenerateControls } from './GenerateControls';
import { GenerateOptionsGrid } from './GenerateOptionsGrid';
import { GenerateVideoControls } from './GenerateVideoControls';

type Selected = Record<'star' | 'action' | 'setting' | 'mood' | 'creative', boolean>;

type StarCharacter = { id: string; name: string; image: string };

export const RemixContent = (props: { asset: Asset | null; sourceAsset?: Asset | null; onSuccess?: () => void }) => {
  const t = useTranslations('RemixContent');
  const { generateImage, generateVideo } = useGenerateService();
  const { isGenerating, start } = useGenerationRun();
  // A remix reruns the generation the asset came from, so a video source goes
  // back to the animation endpoint and an image source to the image endpoint.
  const isVideo = props.asset?.type === 'video';
  const settings = props.asset?.settings;
  // A video only stores what it was animated with, so the image it came from
  // supplies the scene choices it does not keep itself.
  const source = props.sourceAsset?.settings;
  const scene = {
    // Image-to-video stores the same idea under `motion` that style-preset stores under `action`.
    action: settings?.action ?? settings?.motion ?? source?.action ?? null,
    setting: settings?.setting ?? source?.setting ?? null,
    mood: settings?.mood ?? source?.mood ?? null,
    visual: settings?.visual ?? source?.visual ?? null,
    advancedPrompt: settings?.advancedPrompt ?? source?.advancedPrompt ?? null,
  };
  const [assetStar] = useAssetStar(settings?.characterId ?? source?.characterId ?? null);
  const [visual, setVisual] = useState(() => (scene.visual ? settingLabel(scene.visual) : 'Cinematic'));
  const [orientation, setOrientation] = useState(props.asset?.orientation ?? '16:9');
  const [quality, setQuality] = useState(settings?.quality === 'ultra' ? 'Ultra' : 'Balanced');
  const [duration, setDuration] = useState(settings?.duration ? `${settings.duration}s` : '5s');
  const [audioOpen, setAudioOpen] = useState(false);
  const [audio, setAudio] = useState<{ script: string; sceneEmotion: Scene; voiceType: string }>({
    script: '',
    sceneEmotion: 'Happy',
    voiceType: 'Aurora',
  });
  const [selected, setSelected] = useState<Selected>({
    star: false,
    action: !!scene.action,
    setting: !!scene.setting,
    mood: !!scene.mood,
    creative: !!scene.advancedPrompt,
  });
  // Null until the user picks, so the star the asset came from stays the default.
  const [pickedStars, setPickedStars] = useState<StarCharacter[] | null>(null);
  const [advancedPrompt, setAdvancedPrompt] = useState(scene.advancedPrompt);
  const [optionValues, setOptionValues] = useState<{ action: string | null; setting: string | null; mood: string | null }>({
    action: scene.action,
    setting: scene.setting,
    mood: scene.mood,
  });

  const stars = pickedStars ?? (assetStar ? [assetStar] : []);

  const toggle = (key: keyof Selected) => setSelected(prev => ({ ...prev, [key]: !prev[key] }));

  const handleStarsChange = (characters: StarCharacter[]) => {
    setPickedStars(characters);
    setSelected(prev => ({ ...prev, star: characters.length > 0 }));
  };

  const handleOptionSelect = (key: 'action' | 'setting' | 'mood', value: string | null) => {
    setOptionValues(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    if (stars.length === 0) {
      toast.error(t('select_star_first'));
      return;
    }
    const shared = {
      character_ids: stars.map(s => s.id),
      action: optionValues.action ?? undefined,
      setting: optionValues.setting ?? undefined,
      mood: optionValues.mood ?? undefined,
      orientation,
      ...(advancedPrompt ? { advanced_prompt: advancedPrompt } : {}),
    };
    void start(() => (isVideo
      ? generateVideo({
          ...shared,
          mode: 'style_preset',
          quality: quality === 'Balanced' ? 'balance' : 'ultra',
          duration: Number.parseInt(duration, 10),
          ...(audio.script && {
            script: audio.script,
            scene_emotion: audio.sceneEmotion.toLowerCase(),
            voice_type: audio.voiceType.toLowerCase(),
          }),
        })
      : generateImage({
          ...shared,
          visual: visual.toLowerCase(),
          quality: 'balance',
        })), { successMessage: t('scene_ready'), onComplete: props.onSuccess });
  };

  return (
    <div className="flex flex-col gap-2">
      <GenerateOptionsGrid
        selected={{ ...selected, star: stars.length > 0 }}
        onToggle={toggle}
        onOptionSelect={handleOptionSelect}
        onCreativeChange={setAdvancedPrompt}
        starCharacters={stars}
        onStarsChange={handleStarsChange}
        initialOptions={{ action: scene.action, setting: scene.setting, mood: scene.mood }}
        initialCreative={scene.advancedPrompt}
      />
      {isVideo
        ? (
            <GenerateVideoControls
              quality={quality}
              orientation={orientation}
              duration={duration}
              audio={!!audio.script}
              onQualityChange={setQuality}
              onOrientationChange={setOrientation}
              onDurationChange={setDuration}
              onAudioToggle={() => setAudioOpen(true)}
            />
          )
        : (
            <GenerateControls
              visual={visual}
              orientation={orientation}
              onVisualChange={setVisual}
              onOrientationChange={setOrientation}
            />
          )}
      <GenerateButton
        label={isGenerating ? t('generating') : t('remix_scene')}
        coins={isVideo ? 30 : 10}
        onClick={handleGenerate}
        isLoading={isGenerating}
        py="py-2"
        px="px-4"
        textSize="text-xs"
      />

      {audioOpen && (
        <AudioModal
          script={audio.script}
          sceneEmotion={audio.sceneEmotion}
          voiceType={audio.voiceType}
          onSave={setAudio}
          onClose={() => setAudioOpen(false)}
        />
      )}
    </div>
  );
};
