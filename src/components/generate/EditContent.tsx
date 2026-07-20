'use client';

import { useState } from 'react';
import { SelectStarIcon, VisualIcon } from '@/components/icons';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useGenerateService } from '@/services/generateService';
import { GenerateButton } from './GenerateButton';
import { GenerateOptionCard } from './GenerateOptionCard';
import { SelectStarModal } from './SelectStarModal';
import { SelectVisualModal } from './SelectVisualModal';

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

const modelOptions = [
  { value: 'Spark', description: 'Fast and balanced edits' },
  { value: 'Pro', description: 'High-fidelity detailed edits' },
];

type PickedItem = { id: string; name: string };

export const EditContent = (props: { assetId: string; onSuccess?: () => void }) => {
  const { editImage } = useGenerateService();
  const { isGenerating, start } = useGenerationRun();
  const [model, setModel] = useState('Spark');
  const [orientation, setOrientation] = useState('16:9');
  const [modelOpen, setModelOpen] = useState(false);
  const [orientationOpen, setOrientationOpen] = useState(false);
  const [starCharacter, setStarCharacter] = useState<PickedItem | null>(null);
  const [visual, setVisual] = useState<PickedItem | null>(null);
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [visualModalOpen, setVisualModalOpen] = useState(false);

  const handleGenerate = () => {
    void start(() => editImage({
      asset_id: props.assetId,
      model: model.toLowerCase(),
      orientation,
      visual: visual?.name.toLowerCase(),
    }), { successMessage: 'Edit complete!', onComplete: props.onSuccess });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Cards */}
      <div className="grid grid-cols-2 gap-3">
        <GenerateOptionCard
          label="Select Star"
          sublabel="(Required)"
          icon={<SelectStarIcon />}
          height="200px"
          isSelected={!!starCharacter}
          selectedName={starCharacter?.name}
          onClick={() => setStarModalOpen(true)}
          onDeselect={() => setStarCharacter(null)}
        />
        <GenerateOptionCard
          label="Visual"
          sublabel="(Required)"
          icon={<VisualIcon />}
          height="200px"
          isSelected={!!visual}
          selectedName={visual?.name}
          onClick={() => setVisualModalOpen(true)}
          onDeselect={() => setVisual(null)}
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
            Model:
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
            Orientation:
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
        label={isGenerating ? 'Editing...' : 'Edit Scene'}
        coins={10}
        onClick={handleGenerate}
        isLoading={isGenerating || !props.assetId}
        py="py-2"
        px="px-4"
        textSize="text-xs"
      />

      {starModalOpen && (
        <SelectStarModal
          onSelect={(character) => {
            setStarCharacter({ id: character.id, name: character.name });
            setStarModalOpen(false);
          }}
          onClose={() => setStarModalOpen(false)}
        />
      )}

      {visualModalOpen && (
        <SelectVisualModal
          onSelect={(v) => {
            setVisual(v);
            setVisualModalOpen(false);
          }}
          onClose={() => setVisualModalOpen(false)}
        />
      )}
    </div>
  );
};
