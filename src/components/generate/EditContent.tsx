'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SelectStarIcon, VisualIcon } from '@/components/icons';
import { GenerateOptionCard } from './GenerateOptionCard';

const orientationOptions = [
  { value: '4:5', boxW: 'w-10', boxH: 'h-12' },
  { value: '5:4', boxW: 'w-12', boxH: 'h-10' },
  { value: '9:16', boxW: 'w-8', boxH: 'h-14' },
  { value: '16:9', boxW: 'w-14', boxH: 'h-8' },
  { value: '1:1', boxW: 'w-11', boxH: 'h-11' },
];

const CheckMark = () => (
  <div className="shrink-0 rounded-full bg-primary-100 p-1">
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-white">
      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export const EditContent = () => {
  const t = useTranslations('EditContent');
  const tGrid = useTranslations('GenerateOptionsGrid');
  const [model, setModel] = useState('Spark');
  const [orientation, setOrientation] = useState('16:9');
  const [modelOpen, setModelOpen] = useState(false);
  const [orientationOpen, setOrientationOpen] = useState(false);

  const modelOptions: { value: string; description: string }[] = [
    { value: 'Spark', description: t('spark_desc') },
    { value: 'Pro', description: t('pro_desc') },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Cards */}
      <div className="grid grid-cols-2 gap-3">
        <GenerateOptionCard
          label={tGrid('select_star')}
          sublabel={tGrid('required')}
          icon={<SelectStarIcon />}
          height="200px"
        />
        <GenerateOptionCard
          label={t('visual')}
          sublabel={tGrid('required')}
          icon={<VisualIcon />}
          height="200px"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Model */}
        <div className="relative">
          <button
            onClick={() => setModelOpen(prev => !prev)}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-black-40 bg-black-100 px-3 py-3 text-sm font-medium text-white-50 transition-colors hover:border-primary-100"
          >
            {t('model_label')}
            <span className="font-bold text-white">{model}</span>
          </button>
          {modelOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-screen max-w-72 rounded-xl border border-white-25 bg-black-100 py-1 shadow-lg">
              {modelOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setModel(opt.value);
                    setModelOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left hover:bg-black-60"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-white">{opt.value}</span>
                    <span className="text-xs text-white-75">{opt.description}</span>
                  </div>
                  {model === opt.value && <CheckMark />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Orientation */}
        <div className="relative">
          <button
            onClick={() => setOrientationOpen(prev => !prev)}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-black-40 bg-black-100 px-3 py-3 text-sm font-medium text-white-50 transition-colors hover:border-primary-100"
          >
            {t('orientation_label')}
            <span className="font-bold text-white">{orientation}</span>
          </button>
          {orientationOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 rounded-xl border border-white-25 bg-black-100 p-4 shadow-lg">
              <div className="flex items-end gap-3">
                {orientationOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setOrientation(opt.value);
                      setOrientationOpen(false);
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border text-xs font-medium transition-colors ${opt.boxW} ${opt.boxH} ${orientation === opt.value ? 'border-primary-100 text-primary-100' : 'border-white-25 text-white-75 hover:border-white-50'}`}
                  >
                    {opt.value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
