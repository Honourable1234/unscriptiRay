'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { presetsOfType, useGenerateService } from '@/services/generateService';

const orientationOptions = [
  { value: '4:5', boxW: 'w-13', boxH: 'h-18' },
  { value: '9:16', boxW: 'w-11', boxH: 'h-14' },
  { value: '16:9', boxW: 'w-14', boxH: 'h-11' },
  { value: '1:1', boxW: 'w-10', boxH: 'h-10' },
];

export const GenerateControls = (props: {
  visual: string;
  orientation: string;
  onVisualChange: (v: string) => void;
  onOrientationChange: (v: string) => void;
}) => {
  const t = useTranslations('GenerateControls');
  const { getPresets } = useGenerateService();
  const [visualOpen, setVisualOpen] = useState(false);
  const [orientationOpen, setOrientationOpen] = useState(false);
  const [visualOptions, setVisualOptions] = useState<{ value: string; description: string }[]>(() => [
    { value: 'Cinematic', description: t('cinematic_desc') },
    { value: 'Realistic', description: t('realistic_desc') },
    { value: 'Anime', description: t('anime_desc') },
  ]);

  useEffect(() => {
    getPresets().then((res) => {
      const visuals = presetsOfType(res.content ?? [], 'visual')
        .map(p => ({ value: p.display_name || p.name, description: '' }));
      if (visuals.length > 0) {
        setVisualOptions(visuals);
        if (!visuals.some(v => v.value.toLowerCase() === props.visual.toLowerCase())) {
          props.onVisualChange(visuals[0]!.value);
        }
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-184 flex-wrap items-center gap-3">
      <div className="relative">
        <button
          onClick={() => setVisualOpen(prev => !prev)}
          className="flex cursor-pointer items-center gap-1 rounded-xl border border-black-40 bg-black-100 px-6 py-3 text-sm font-medium text-white-50 transition-colors hover:border-primary-100"
        >
          {t('visual_label')}
          <span className="text-white">{props.visual}</span>
        </button>
        {visualOpen && (
          <div className="absolute top-full left-0 z-50 mt-1 w-65 max-w-100 rounded-xl border border-white-25 bg-black-100 py-1 shadow-lg sm:w-screen">
            {visualOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  props.onVisualChange(opt.value);
                  setVisualOpen(false);
                }}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left hover:bg-black-60"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">{opt.value}</span>
                  <span className="text-xs text-white-75">{opt.description}</span>
                </div>
                {props.visual === opt.value && (
                  <div className="rounded-full bg-primary-100 p-1">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 text-white">
                      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setOrientationOpen(prev => !prev)}
          className="flex cursor-pointer items-center gap-1 rounded-xl border border-black-40 bg-black-100 px-6 py-3 text-sm font-medium text-white-50 transition-colors hover:border-primary-100"
        >
          {t('orientation_label')}
          <span className="text-white">{props.orientation}</span>
        </button>
        {orientationOpen && (
          <div className="absolute top-full left-0 z-50 mt-1 rounded-xl border border-white-25 bg-black-100 p-4 shadow-lg">
            <div className="flex items-end gap-3">
              {orientationOptions.map((opt) => {
                const isSelected = props.orientation === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      props.onOrientationChange(opt.value);
                      setOrientationOpen(false);
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 text-xs font-medium transition-colors ${opt.boxW} ${opt.boxH} ${isSelected ? 'border-primary-100 text-primary-100' : 'border-white text-white-75 hover:border-white-50'}`}
                  >
                    {opt.value}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
