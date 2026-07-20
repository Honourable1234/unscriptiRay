'use client';

import type { PickOption } from './PickOptionModal';
import type { Preset } from '@/services/generateService';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ActionIcon, EmojiIcon, InputIcon, SelectStarIcon, SettingIcon } from '@/components/icons';
import { presetsOfType, useGenerateService } from '@/services/generateService';
import { CreativeInputModal } from './CreativeInputModal';
import { GenerateOptionCard } from './GenerateOptionCard';
import { GenerateOptionCardWide } from './GenerateOptionCardWide';
import { PickOptionModal } from './PickOptionModal';
import { SelectStarModal } from './SelectStarModal';

type SelectedOptions = {
  star: boolean;
  action: boolean;
  setting: boolean;
  mood: boolean;
  creative: boolean;
};

type PickKey = 'action' | 'setting' | 'mood';

const toOptions = (values: string[]): PickOption[] => values.map(v => ({ value: v, label: v }));

const DEFAULT_OPTIONS: Record<PickKey, PickOption[]> = {
  action: toOptions(['Walk', 'Run', 'Dance', 'Fight', 'Sit', 'Fly', 'Jump', 'Swim', 'Pose', 'Hug', 'Cry', 'Laugh']),
  setting: toOptions(['Urban Street', 'Forest', 'Beach', 'Mountain', 'Indoor', 'Outer Space', 'Desert', 'Castle', 'Underwater', 'Jungle', 'Office', 'Rooftop']),
  mood: toOptions(['Happy', 'Sad', 'Angry', 'Romantic', 'Mysterious', 'Epic', 'Calm', 'Tense', 'Playful', 'Fearful', 'Excited', 'Nostalgic']),
};

export const GenerateOptionsGrid = (props: {
  selected: SelectedOptions;
  onToggle: (key: keyof SelectedOptions) => void;
  onOptionSelect?: (key: PickKey, value: string | null) => void;
  onCreativeChange?: (value: string | null) => void;
  starCharacter?: { id: string; name: string; image: string } | null;
  onStarSelect?: (character: { id: string; name: string; image: string }) => void;
}) => {
  const t = useTranslations('GenerateOptionsGrid');
  const { getPresets } = useGenerateService();
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [openPickModal, setOpenPickModal] = useState<PickKey | null>(null);
  const [creativeModalOpen, setCreativeModalOpen] = useState(false);
  const [creativePrompt, setCreativePrompt] = useState('');
  const [optionValues, setOptionValues] = useState<Record<PickKey, PickOption | null>>({
    action: null,
    setting: null,
    mood: null,
  });
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    getPresets().then((res) => {
      if (res.success && Array.isArray(res.content)) {
        setPresets(res.content);
      }
    }).catch(() => {});
  }, []);

  const handleStarClick = () => {
    if (props.selected.star) {
      props.onToggle('star');
    } else {
      setStarModalOpen(true);
    }
  };

  const handleStarSelect = (character: { id: string; name: string; image: string }) => {
    props.onStarSelect?.(character);
  };

  const handlePickSelect = (key: PickKey, option: PickOption) => {
    setOptionValues(prev => ({ ...prev, [key]: option }));
    if (!props.selected[key]) {
      props.onToggle(key);
    }
    props.onOptionSelect?.(key, option.value);
  };

  const handlePickDeselect = (key: PickKey) => {
    setOptionValues(prev => ({ ...prev, [key]: null }));
    if (props.selected[key]) {
      props.onToggle(key);
    }
    props.onOptionSelect?.(key, null);
  };

  const handleCreativeSave = (value: string) => {
    const trimmed = value.trim();
    setCreativePrompt(trimmed);
    if (!!trimmed !== props.selected.creative) {
      props.onToggle('creative');
    }
    props.onCreativeChange?.(trimmed || null);
  };

  const pickOptions = (key: PickKey): PickOption[] => {
    const fromPresets = presetsOfType(presets, key).map(p => ({
      value: p.name,
      label: p.display_name || p.name,
    }));
    return fromPresets.length > 0 ? fromPresets : DEFAULT_OPTIONS[key];
  };

  const pickTitles: Record<PickKey, string> = {
    action: t('action'),
    setting: t('setting'),
    mood: t('mood'),
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-184 flex-col gap-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
          {/* Star */}
          <GenerateOptionCard
            label={t('select_star')}
            sublabel={t('required')}
            icon={<SelectStarIcon />}
            isSelected={props.selected.star}
            onClick={handleStarClick}
            selectedImage={props.starCharacter?.image}
            selectedName={props.starCharacter?.name}
            onDeselect={() => props.onToggle('star')}
          />

          {/* Action */}
          <GenerateOptionCard
            label={t('action')}
            sublabel={t('optional')}
            icon={<ActionIcon />}
            isSelected={props.selected.action}
            onClick={() => setOpenPickModal('action')}
            selectedName={optionValues.action?.label}
            onDeselect={() => handlePickDeselect('action')}
          />

          {/* Setting */}
          <GenerateOptionCard
            label={t('setting')}
            sublabel={t('optional')}
            icon={<SettingIcon />}
            isSelected={props.selected.setting}
            onClick={() => setOpenPickModal('setting')}
            selectedName={optionValues.setting?.label}
            onDeselect={() => handlePickDeselect('setting')}
          />

          {/* Mood */}
          <GenerateOptionCard
            label={t('mood')}
            sublabel={t('optional')}
            icon={<EmojiIcon />}
            isSelected={props.selected.mood}
            onClick={() => setOpenPickModal('mood')}
            selectedName={optionValues.mood?.label}
            onDeselect={() => handlePickDeselect('mood')}
          />
        </div>

        <GenerateOptionCardWide
          label={t('creative_input')}
          sublabel={t('creator_tier')}
          icon={<InputIcon />}
          isSelected={props.selected.creative}
          selectedName={creativePrompt || undefined}
          onClick={() => setCreativeModalOpen(true)}
        />
      </div>

      {starModalOpen && (
        <SelectStarModal
          onSelect={handleStarSelect}
          onClose={() => setStarModalOpen(false)}
        />
      )}

      {openPickModal && (
        <PickOptionModal
          title={pickTitles[openPickModal]}
          options={pickOptions(openPickModal)}
          selected={optionValues[openPickModal]?.value ?? null}
          onSelect={option => handlePickSelect(openPickModal, option)}
          onClose={() => setOpenPickModal(null)}
        />
      )}

      {creativeModalOpen && (
        <CreativeInputModal
          value={creativePrompt}
          characterId={props.starCharacter?.id}
          onSave={handleCreativeSave}
          onClose={() => setCreativeModalOpen(false)}
        />
      )}
    </>
  );
};
