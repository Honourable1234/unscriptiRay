'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useGenerateService } from '@/services/generateService';
import { GenerateButton } from './GenerateButton';
import { GenerateControls } from './GenerateControls';
import { GenerateOptionsGrid } from './GenerateOptionsGrid';

type Selected = Record<'star' | 'action' | 'setting' | 'mood' | 'creative', boolean>;

export const RemixContent = (props: { onSuccess?: () => void }) => {
  const { generateImage, pollGenerationStatus } = useGenerateService();
  const [isGenerating, setIsGenerating] = useState(false);
  const [visual, setVisual] = useState('Cinematic');
  const [orientation, setOrientation] = useState('16:9');
  const [selected, setSelected] = useState<Selected>({ star: false, action: false, setting: false, mood: false, creative: false });
  const [starCharacter, setStarCharacter] = useState<{ id: string; name: string; image: string } | null>(null);
  const [optionValues, setOptionValues] = useState<{ action: string | null; setting: string | null; mood: string | null }>({ action: null, setting: null, mood: null });
  const stopPollRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stopPollRef.current?.();
    };
  }, []);

  const toggle = (key: keyof Selected) => setSelected(prev => ({ ...prev, [key]: !prev[key] }));

  const handleStarSelect = (character: { id: string; name: string; image: string }) => {
    setStarCharacter(character);
    setSelected(prev => ({ ...prev, star: true }));
  };

  const handleOptionSelect = (key: 'action' | 'setting' | 'mood', value: string | null) => {
    setOptionValues(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!starCharacter) {
      toast.error('Please select a star first.');
      return;
    }
    stopPollRef.current?.();
    setIsGenerating(true);
    try {
      const res = await generateImage({
        character_ids: [starCharacter.id],
        action: optionValues.action ?? undefined,
        setting: optionValues.setting ?? undefined,
        mood: optionValues.mood ?? undefined,
        visual: visual.toLowerCase(),
        orientation,
        quality: 'balance',
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
    <div className="flex flex-col gap-2">
      <GenerateOptionsGrid
        selected={selected}
        onToggle={toggle}
        onOptionSelect={handleOptionSelect}
        starCharacter={starCharacter}
        onStarSelect={handleStarSelect}
      />
      <GenerateControls
        visual={visual}
        orientation={orientation}
        onVisualChange={setVisual}
        onOrientationChange={setOrientation}
      />
      <GenerateButton
        label={isGenerating ? 'Generating...' : 'Remix Scene'}
        coins={10}
        onClick={handleGenerate}
        isLoading={isGenerating}
        py="py-2"
        px="px-4"
        textSize="text-xs"
      />
    </div>
  );
};
