'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ActionIcon, EmojiIcon, InputIcon, SelectStarIcon, SettingIcon } from '@/components/icons';
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

const ACTION_OPTIONS = ['Walk', 'Run', 'Dance', 'Fight', 'Sit', 'Fly', 'Jump', 'Swim', 'Pose', 'Hug', 'Cry', 'Laugh'];
const SETTING_OPTIONS = ['Urban Street', 'Forest', 'Beach', 'Mountain', 'Indoor', 'Outer Space', 'Desert', 'Castle', 'Underwater', 'Jungle', 'Office', 'Rooftop'];
const MOOD_OPTIONS = ['Happy', 'Sad', 'Angry', 'Romantic', 'Mysterious', 'Epic', 'Calm', 'Tense', 'Playful', 'Fearful', 'Excited', 'Nostalgic'];

export const GenerateOptionsGrid = (props: {
  selected: SelectedOptions;
  onToggle: (key: keyof SelectedOptions) => void;
  onOptionSelect?: (key: 'action' | 'setting' | 'mood', value: string | null) => void;
  starCharacter?: { id: string; name: string; image: string } | null;
  onStarSelect?: (character: { id: string; name: string; image: string }) => void;
}) => {
  const t = useTranslations('GenerateOptionsGrid');
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [openPickModal, setOpenPickModal] = useState<'action' | 'setting' | 'mood' | null>(null);
  const [optionValues, setOptionValues] = useState<{ action: string | null; setting: string | null; mood: string | null }>({
    action: null,
    setting: null,
    mood: null,
  });

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

  const handlePickSelect = (key: 'action' | 'setting' | 'mood', value: string) => {
    setOptionValues(prev => ({ ...prev, [key]: value }));
    if (!props.selected[key]) {
      props.onToggle(key);
    }
    props.onOptionSelect?.(key, value);
  };

  const handlePickDeselect = (key: 'action' | 'setting' | 'mood') => {
    setOptionValues(prev => ({ ...prev, [key]: null }));
    if (props.selected[key]) {
      props.onToggle(key);
    }
    props.onOptionSelect?.(key, null);
  };

  const pickOptions: Record<'action' | 'setting' | 'mood', string[]> = {
    action: ACTION_OPTIONS,
    setting: SETTING_OPTIONS,
    mood: MOOD_OPTIONS,
  };

  const pickTitles: Record<'action' | 'setting' | 'mood', string> = {
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
            selectedName={optionValues.action ?? undefined}
            onDeselect={() => handlePickDeselect('action')}
          />

          {/* Setting */}
          <GenerateOptionCard
            label={t('setting')}
            sublabel={t('optional')}
            icon={<SettingIcon />}
            isSelected={props.selected.setting}
            onClick={() => setOpenPickModal('setting')}
            selectedName={optionValues.setting ?? undefined}
            onDeselect={() => handlePickDeselect('setting')}
          />

          {/* Mood */}
          <GenerateOptionCard
            label={t('mood')}
            sublabel={t('optional')}
            icon={<EmojiIcon />}
            isSelected={props.selected.mood}
            onClick={() => setOpenPickModal('mood')}
            selectedName={optionValues.mood ?? undefined}
            onDeselect={() => handlePickDeselect('mood')}
          />
        </div>

        <GenerateOptionCardWide
          label={t('creative_input')}
          sublabel={t('creator_tier')}
          icon={<InputIcon />}
          isSelected={props.selected.creative}
          onClick={() => props.onToggle('creative')}
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
          options={pickOptions[openPickModal]}
          selected={optionValues[openPickModal]}
          onSelect={value => handlePickSelect(openPickModal, value)}
          onClose={() => setOpenPickModal(null)}
        />
      )}
    </>
  );
};
