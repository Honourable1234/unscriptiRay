'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useCreate } from '@/context/CreateContext';
import { useCharacterService } from '@/services/useCharacterService';
import { CharacterDropdown } from './CharacterDropdown';
import { eyeColorMap, hairColorMap, skinToneMap } from './colorMaps';
import { CreateStyleCard } from './CreateStyleCard';
import { EthnicCard } from './EthnicCard';

type Style = {
  value: string;
  display_name: string;
  image_url: string | null;
};

type AppearanceOptions = {
  ethnic_influence: string[];
  eye_color: string[];
  eye_intensity: string[];
  facial_shape: string[];
  figure_type: string[];
  hair_color: string[];
  hair_style: string[];
  hip_profile: string[];
  bust_profile: string[];
  skin_tone: string[];
};

type Size = 'default' | 'hair';

export const CreateStep1 = (props: { onValidChange?: (valid: boolean) => void }) => {
  const t = useTranslations('CreateStep1');
  const appearanceFields: { key: keyof AppearanceOptions; label: string; color?: string; size?: Size; colorLookup?: Record<string, string>; hideLabel?: boolean }[] = [
    { key: 'ethnic_influence', label: t('ethnic_influence') },
    { key: 'eye_color', label: t('eye_color'), colorLookup: eyeColorMap, size: 'hair', hideLabel: true },
    { key: 'eye_intensity', label: t('eye_intensity') },
    { key: 'facial_shape', label: t('facial_shape') },
    { key: 'figure_type', label: t('figure_type') },
    { key: 'hair_color', label: t('hair_color'), colorLookup: hairColorMap, size: 'hair', hideLabel: true },
    { key: 'hair_style', label: t('hair_style') },
    { key: 'hip_profile', label: t('hip_profile') },
    { key: 'bust_profile', label: t('bust_profile') },
    { key: 'skin_tone', label: t('skin_tone'), colorLookup: skinToneMap, size: 'hair', hideLabel: true },
  ];
  const { getCreationOptions } = useCharacterService();
  const { data, setStyle, setAppearance: setAppearanceCtx } = useCreate();
  const [styles, setStyles] = useState<Style[]>([]);
  const [appearance, setAppearance] = useState<AppearanceOptions>({
    ethnic_influence: [],
    eye_color: [],
    eye_intensity: [],
    facial_shape: [],
    figure_type: [],
    hair_color: [],
    hair_style: [],
    hip_profile: [],
    bust_profile: [],
    skin_tone: [],
  });

  const select = (key: keyof AppearanceOptions, value: string) => {
    setAppearanceCtx(key, value);
  };

  useEffect(() => {
    const allFilled = !!data.style && appearanceFields.every(f => !!data.appearance[f.key]);
    props.onValidChange?.(allFilled);
  }, [data.appearance, data.style, props.onValidChange]);

  useEffect(() => {
    getCreationOptions().then((res) => {
      const content = res?.content ?? res;
      setStyles(content?.styles ?? []);
      const a = content?.appearance ?? {};
      setAppearance({
        ethnic_influence: a.ethnic_influence ?? [],
        eye_color: a.eye_color ?? [],
        eye_intensity: a.eye_intensity ?? [],
        facial_shape: a.facial_shape ?? [],
        figure_type: a.figure_type ?? [],
        hair_color: a.hair_color ?? [],
        hair_style: a.hair_style ?? [],
        hip_profile: a.hip_profile ?? [],
        bust_profile: a.bust_profile ?? [],
        skin_tone: a.skin_tone ?? [],
      });
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {styles.map(style => (
          <CreateStyleCard
            key={style.value}
            label={style.display_name}
            imageUrl={style.image_url}
            selected={data.style === style.value}
            onClick={() => setStyle(style.value)}
          />
        ))}
      </div>

      {appearanceFields.map(({ key, label, color, size, colorLookup, hideLabel }) => (
        <CharacterDropdown key={key} title={label} hasSelection={!!data.appearance[key]}>
          <div className="flex flex-wrap gap-3">
            {appearance[key].map(item => (
              <EthnicCard
                key={item}
                label={item}
                color={colorLookup ? (colorLookup[item] ?? color) : color}
                size={size}
                hideLabel={hideLabel}
                selected={data.appearance[key] === item}
                onClick={() => select(key, item)}
              />
            ))}
          </div>
        </CharacterDropdown>
      ))}
    </div>
  );
};
