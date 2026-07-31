'use client';

import type { PickOption, PickOptionType } from './PickOptionModal';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ActionIcon, EmojiIcon, InputIcon, SelectStarIcon, SettingIcon } from '@/components/icons';
import { presetsOfType, settingLabel, useGenerateService } from '@/services/generateService';
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

const pickKeys: PickKey[] = ['action', 'setting', 'mood'];

/**
 * Turns a value stored with an asset into the option shape the pick cards render.
 * @param value - Stored value such as `rooftop_at_sunset`.
 * @returns The option to show as already picked, or null when there is none.
 */
const toPickedOption = (value: string | null | undefined): PickOption | null =>
  value ? { value, label: settingLabel(value) } : null;

/**
 * Loosens a preset name for comparison, since stored values separate words with
 * underscores or spaces depending on when they were generated.
 * @param value - Preset name or a value stored with an asset.
 * @returns The value lowercased with single spaces between words.
 */
const looseName = (value: string) => value.toLowerCase().replace(/[\s_-]+/g, ' ').trim();

export const GenerateOptionsGrid = (props: {
  selected: SelectedOptions;
  onToggle: (key: keyof SelectedOptions) => void;
  onOptionSelect?: (key: PickKey, value: string | null) => void;
  onCreativeChange?: (value: string | null) => void;
  starCharacters?: StarCharacter[];
  onStarsChange?: (characters: StarCharacter[]) => void;
  multipleStars?: boolean;
  /** Values the source asset was generated with, shown as already picked. */
  initialOptions?: Partial<Record<PickKey, string | null>>;
  /** Advanced prompt the source asset was generated with. */
  initialCreative?: string | null;
}) => {
  const t = useTranslations('GenerateOptionsGrid');
  const { getPresets } = useGenerateService();
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [openPickModal, setOpenPickModal] = useState<PickKey | null>(null);
  const [creativeModalOpen, setCreativeModalOpen] = useState(false);
  const [creativePrompt, setCreativePrompt] = useState(props.initialCreative ?? '');
  const [optionValues, setOptionValues] = useState<Record<PickKey, PickOption | null>>(() => ({
    action: toPickedOption(props.initialOptions?.action),
    setting: toPickedOption(props.initialOptions?.setting),
    mood: toPickedOption(props.initialOptions?.mood),
  }));

  // Prefilled values arrive as bare names, so their preset thumbnails are looked
  // up once to match how a card looks after picking it from the modal.
  useEffect(() => {
    if (!pickKeys.some(key => props.initialOptions?.[key])) {
      return;
    }
    getPresets().then((res) => {
      const presets = res.content ?? [];
      setOptionValues((prev) => {
        const next = { ...prev };
        for (const key of pickKeys) {
          const current = next[key];
          if (!current || current.image) {
            continue;
          }
          const preset = presetsOfType(presets, key).find(p => looseName(p.name) === looseName(current.value));
          if (preset?.image_url) {
            next[key] = { ...current, label: preset.display_name || current.label, image: preset.image_url };
          }
        }
        return next;
      });
    }).catch(() => {});
  }, []);

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
