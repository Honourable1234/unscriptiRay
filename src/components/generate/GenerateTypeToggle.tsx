'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { MediaIcon, PictureIcon, SelectStarIcon, SparkleIcon, VideoIcon, VoiceIcon } from '@/components/icons';

type GenerateType = 'still' | 'animated';
export type GenerateMode = 'style_present' | 'image_to_video' | 'extend_video' | 'talking' | 'edit_style';

type ModeOption = { value: GenerateMode; label: string; icon: React.ReactNode };

const modeOptions: Record<GenerateType, ModeOption[]> = {
  animated: [
    { value: 'style_present', label: 'Style Present', icon: <SparkleIcon /> },
    { value: 'image_to_video', label: 'Image to Video', icon: <SelectStarIcon /> },
    { value: 'extend_video', label: 'Extend Video', icon: <MediaIcon /> },
    { value: 'talking', label: 'Talking', icon: <VoiceIcon /> },
  ],
  still: [
    { value: 'style_present', label: 'Style Present', icon: <SparkleIcon /> },
    { value: 'edit_style', label: 'edit style', icon: <SelectStarIcon /> },
  ],
};

export const GenerateTypeToggle = (props: {
  active: GenerateType;
  mode: GenerateMode;
  onChange: (type: GenerateType) => void;
  onModeChange: (mode: GenerateMode) => void;
}) => {
  const t = useTranslations('GenerateTypeToggle');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const tabs: { label: string; value: GenerateType; icon: React.ReactNode }[] = [
    { label: t('still_images'), value: 'still', icon: <PictureIcon /> },
    { label: t('animated_scenes'), value: 'animated', icon: <VideoIcon /> },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const activeOption = modeOptions[props.active].find(o => o.value === props.mode) ?? modeOptions[props.active][0]!;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 py-2 md:py-4">
      <div className="flex flex-wrap rounded-xl border border-black-40 bg-black-100 px-2 py-1">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => props.onChange(tab.value)}
            className={`m-auto flex cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors sm:px-12 ${props.active === tab.value ? 'border border-primary-100 bg-black-40 bg-primary-100/10 text-primary-100 transition-colors hover:bg-primary-100/20' : 'text-white hover:text-white-75'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setDropdownOpen(prev => !prev)}
          className="cursor-pointer items-center rounded-xl border border-success-100 bg-success-100/10 px-6 py-2 text-start text-sm leading-none font-medium text-success-100 transition-colors hover:bg-success-100/20"
        >
          <p className="text-xs text-white capitalize">{t('mode')}</p>
          <p className="flex items-center gap-1.5">
            {activeOption.label}
            {activeOption.icon}
          </p>
        </button>

        {dropdownOpen && (
          <div className="absolute top-full right-0 z-50 mt-2 min-w-48 rounded-xl border border-black-40 bg-black-80 py-1 shadow-lg">
            {modeOptions[props.active].map(option => (
              <button
                key={option.value}
                onClick={() => {
                  props.onModeChange(option.value);
                  setDropdownOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-black-60 ${props.mode === option.value ? 'text-success-100' : 'text-white'}`}
              >
                {option.label}
                <span className={props.mode === option.value ? 'text-success-100' : 'text-white-50'}>
                  {option.icon}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export type { GenerateType };
