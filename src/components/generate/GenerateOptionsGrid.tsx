'use client';

import type { PickOption, PickOptionType } from './PickOptionModal';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ActionIcon, EmojiIcon, InputIcon, SelectStarIcon, SettingIcon } from '@/components/icons';
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

type PickKey = PickOptionType;

type StarCharacter = { id: string; name: string; image: string };

const MAX_STARS = 4;

export const GenerateOptionsGrid = (props: {
  selected: SelectedOptions;
  onToggle: (key: keyof SelectedOptions) => void;
  onOptionSelect?: (key: PickKey, value: string | null) => void;
  onCreativeChange?: (value: string | null) => void;
  starCharacters?: StarCharacter[];
  onStarsChange?: (characters: StarCharacter[]) => void;
  multipleStars?: boolean;
}) => {
  const t = useTranslations('GenerateOptionsGrid');
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [openPickModal, setOpenPickModal] = useState<PickKey | null>(null);
  const [creativeModalOpen, setCreativeModalOpen] = useState(false);
  const [creativePrompt, setCreativePrompt] = useState('');
  const [optionValues, setOptionValues] = useState<Record<PickKey, PickOption | null>>({
    action: null,
    setting: null,
    mood: null,
  });

  const stars = props.starCharacters ?? [];

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
            isSelected={stars.length > 0}
            selectedImage={stars[0]?.image}
            selectedName={stars.length > 1 ? t('stars_count', { count: stars.length }) : stars[0]?.name}
            badge={stars.length > 1 ? `+${stars.length - 1}` : undefined}
            onClick={() => setStarModalOpen(true)}
            onDeselect={() => props.onStarsChange?.([])}
          />

          {/* Action */}
          <GenerateOptionCard
            label={t('action')}
            sublabel={t('optional')}
            icon={<ActionIcon />}
            isSelected={props.selected.action}
            onClick={() => setOpenPickModal('action')}
            selectedImage={optionValues.action?.image}
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
            selectedImage={optionValues.setting?.image}
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
            selectedImage={optionValues.mood?.image}
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
        props.multipleStars
          ? (
              <SelectStarModal
                multiple
                selected={stars}
                max={MAX_STARS}
                onConfirm={characters => props.onStarsChange?.(characters)}
                onClose={() => setStarModalOpen(false)}
              />
            )
          : (
              <SelectStarModal
                onSelect={character => props.onStarsChange?.([character])}
                onClose={() => setStarModalOpen(false)}
              />
            )
      )}

      {openPickModal && (
        <PickOptionModal
          title={pickTitles[openPickModal]}
          type={openPickModal}
          selected={optionValues[openPickModal]?.value ?? null}
          onSelect={option => handlePickSelect(openPickModal, option)}
          onClose={() => setOpenPickModal(null)}
        />
      )}

      {creativeModalOpen && (
        <CreativeInputModal
          value={creativePrompt}
          characterId={stars[0]?.id}
          onSave={handleCreativeSave}
          onClose={() => setCreativeModalOpen(false)}
        />
      )}
    </>
  );
};
