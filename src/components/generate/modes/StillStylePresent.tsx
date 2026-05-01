'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { GenerateControls } from '@/components/generate/GenerateControls';
import { GenerateOptionsGrid } from '@/components/generate/GenerateOptionsGrid';
import { useGenerateService } from '@/services/generateService';

type SelectedOptions = {
  star: boolean;
  action: boolean;
  setting: boolean;
  mood: boolean;
  creative: boolean;
};

export const StillStylePresent = (props: {
  initialCharacter?: { id: string; name: string; image: string } | null;
}) => {
  const { generateImage } = useGenerateService();
  const [isGenerating, setIsGenerating] = useState(false);
  const [visual, setVisual] = useState('Cinematic');
  const [orientation, setOrientation] = useState('16:9');
  const [starCharacter, setStarCharacter] = useState(props.initialCharacter ?? null);
  const [selected, setSelected] = useState<SelectedOptions>({
    star: !!props.initialCharacter,
    action: false,
    setting: false,
    mood: false,
    creative: false,
  });

  const handleToggle = (key: keyof SelectedOptions) => {
    if (key === 'star' && selected.star) {
      setStarCharacter(null);
    }
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const characterIds = starCharacter ? [starCharacter.id] : [];
      await generateImage({ character_ids: characterIds, visual: visual.toLowerCase(), orientation });
      toast.success('Image generation started!');
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
      <GenerateOptionsGrid
        selected={selected}
        onToggle={handleToggle}
        starCharacter={starCharacter}
        onStarSelect={(character) => {
          setStarCharacter(character);
          setSelected(prev => ({ ...prev, star: true }));
        }}
      />
      <GenerateControls
        visual={visual}
        orientation={orientation}
        onVisualChange={setVisual}
        onOrientationChange={setOrientation}
      />
      <GenerateButton
        label="Generate Image"
        coins={10}
        onClick={handleGenerate}
        isLoading={isGenerating || !selected.star}
      />
    </div>
  );
};
