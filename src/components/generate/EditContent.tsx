'use client';

import type { Asset } from '@/services/generateService';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { SelectStarIcon } from '@/components/icons';
import { useAssetStar } from '@/hooks/useAssetStar';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { matchSetting, useGenerateService } from '@/services/generateService';
import { GenerateButton } from './GenerateButton';
import { GenerateOptionCard } from './GenerateOptionCard';
import { SelectStarModal } from './SelectStarModal';

const orientationOptions = [
  { value: '4:5', boxW: 'w-10', boxH: 'h-12' },
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

const modelOptions = [
  { value: 'Spark', description: 'Fast and balanced edits' },
  { value: 'Pro', description: 'High-fidelity detailed edits' },
];

const visualOptions = [
  { value: 'Cinematic', description: 'High-quality results with strong prompt accuracy' },
  { value: 'Realistic', description: 'Ultra-realistic visuals with enhanced lighting' },
];

export const EditContent = (props: { asset: Asset | null; onSuccess?: () => void }) => {
  const t = useTranslations('EditContent');
  const { editImage } = useGenerateService();
  const { isGenerating, start } = useGenerationRun();
  // The modal opens on the settings the asset was generated with, so an edit
  // starts from the current scene instead of a blank form.
  const settings = props.asset?.settings;
  const [model, setModel] = useState(() => matchSetting(settings?.model, modelOptions.map(o => o.value)) ?? 'Spark');
  const [orientation, setOrientation] = useState(props.asset?.orientation ?? '16:9');
  const [modelOpen, setModelOpen] = useState(false);
  const [orientationOpen, setOrientationOpen] = useState(false);
  const [starCharacter, setStarCharacter] = useAssetStar(settings?.characterId ?? null);
  const [visual, setVisual] = useState(() => matchSetting(settings?.visual, visualOptions.map(o => o.value)) ?? 'Cinematic');
  const [visualOpen, setVisualOpen] = useState(false);
  const [starModalOpen, setStarModalOpen] = useState(false);

  const handleGenerate = () => {
    void start(() => editImage({
      asset_id: props.asset?.id ?? '',
      model: model.toLowerCase(),
      orientation,
      visual: visual.toLowerCase(),
    }), { successMessage: t('edit_complete'), onComplete: props.onSuccess });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Cards — the scene being edited, next to the star it came from */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative h-50 overflow-hidden rounded-xl border border-white-25 bg-black-100">
          {props.asset && (props.asset.type === 'video'
            ? (
                // Edit is offered on videos too, and the image optimizer cannot read those.
                <video src={`${props.asset.url}#t=0.1`} preload="metadata" muted playsInline className="h-full w-full object-cover">
                  <track kind="captions" />
                </video>
              )
            : <Image src={props.asset.url} alt={t('scene_alt')} fill sizes="320px" className="object-cover" />)}
        </div>
        <GenerateOptionCard
          label={t('select_star')}
          sublabel={t('required')}
          icon={<SelectStarIcon />}
          height="200px"
          isSelected={!!starCharacter}
          selectedImage={starCharacter?.image}
          selectedName={starCharacter?.name}
          onClick={() => setStarModalOpen(true)}
          onDeselect={() => setStarCharacter(null)}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Visual */}
        <div className="relative">
          <button
            onClick={() => setVisualOpen(prev => !prev)}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-black-40 bg-black-100 px-3 py-3 text-sm font-medium text-white-50 transition-colors hover:border-primary-100"
          >
            {t('visual_label')}
            <span className="font-bold text-white">{visual}</span>
          </button>
          {visualOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-screen max-w-72 rounded-xl border border-white-25 bg-black-100 py-1 shadow-lg">
              {visualOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setVisual(opt.value);
                    setVisualOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left hover:bg-black-60"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-white">{opt.value}</span>
                    <span className="text-xs text-white-75">{opt.description}</span>
                  </div>
                  {visual === opt.value && <CheckMark />}
                </button>
              ))}
            </div>
          )}
        </div>

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

      <GenerateButton
        label={isGenerating ? t('editing') : t('edit_scene')}
        coins={10}
        onClick={handleGenerate}
        isLoading={isGenerating || !props.asset}
        py="py-2"
        px="px-4"
        textSize="text-xs"
      />

      {starModalOpen && (
        <SelectStarModal
          onSelect={(character) => {
            setStarCharacter(character);
            setStarModalOpen(false);
          }}
          onClose={() => setStarModalOpen(false)}
        />
      )}
    </div>
  );
};
