'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { SignUpPromptModal } from '@/components/general/SignUpPromptModal';
import { EditStyle } from '@/components/generate/EditStyle';
import { GenerateButton } from '@/components/generate/GenerateButton';
import { SelectVisualModal } from '@/components/generate/SelectVisualModal';
import { StackedCoinIcon } from '@/components/icons';
import { useGenerationRun } from '@/hooks/useGenerationRun';
import { useGenerateService } from '@/services/generateService';

const modelOptions = [
  { value: 'Spark', description: 'Best for outfits, backgrounds and effects', coins: 10 },
  { value: 'Eclipse', description: 'Optimized for NSFW and anatomical detail', coins: 20 },
];

const orientationOptions = [
  { value: '4:5', boxW: 'w-13', boxH: 'h-18' },
  { value: '9:16', boxW: 'w-11', boxH: 'h-14' },
  { value: '16:9', boxW: 'w-14', boxH: 'h-11' },
  { value: '1:1', boxW: 'w-10', boxH: 'h-10' },
];

export const StillEditStyle = (props: {
  onGenerated?: () => void;
  onGenerationStart?: (generationId: string) => void;
  onGenerationEnd?: (generationId: string) => void;
}) => {
  const t = useTranslations('StillEditStyle');
  const { generateImage, uploadReference } = useGenerateService();
  const { isGenerating, needsSignUp, dismissSignUpPrompt, start } = useGenerationRun();
  const [model, setModel] = useState('Spark');
  const [orientation, setOrientation] = useState('16:9');
  const [modelOpen, setModelOpen] = useState(false);
  const [orientationOpen, setOrientationOpen] = useState(false);
  const [reference, setReference] = useState<{ key: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [visual, setVisual] = useState<{ id: string; name: string } | null>(null);
  const [visualModalOpen, setVisualModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeModel = modelOptions.find(m => m.value === model) ?? modelOptions[0]!;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) {
      return;
    }
    setIsUploading(true);
    try {
      const uploaded = await uploadReference(file);
      setReference({ key: uploaded.key, name: file.name });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('upload_failed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = () => {
    if (!reference || !visual) {
      return;
    }
    void start(() => generateImage({
      reference_image_key: reference.key,
      visual: visual.name.toLowerCase(),
      orientation,
      quality: model === 'Eclipse' ? 'ultra' : 'balance',
    }), {
      successMessage: t('image_ready'),
      onComplete: props.onGenerated,
      onStart: props.onGenerationStart,
      onSettled: props.onGenerationEnd,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <EditStyle
        imageName={reference?.name ?? null}
        isUploading={isUploading}
        visualName={visual?.name ?? null}
        onImageClick={() => fileInputRef.current?.click()}
        onImageClear={() => setReference(null)}
        onVisualClick={() => setVisualModalOpen(true)}
        onVisualClear={() => setVisual(null)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => void handleFileChange(e)}
      />

      <div className="mx-auto flex w-full max-w-184 flex-wrap items-center gap-3">
        {/* Model dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setModelOpen(prev => !prev);
              setOrientationOpen(false);
            }}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-black-40 bg-black-100 px-6 py-3 text-sm font-medium text-white-50 transition-colors hover:border-primary-100"
          >
            {t('model_label')}
            <span className="text-white">{model}</span>
          </button>
          {modelOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-72 rounded-xl border border-white-25 bg-black-100 py-1 shadow-lg">
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
                    <span className="mt-1 flex w-fit items-center gap-1 rounded-lg bg-black-40 px-2 py-1 text-xs font-semibold text-white">
                      {opt.coins}
                      {' '}
                      <StackedCoinIcon />
                    </span>
                  </div>
                  {model === opt.value && (
                    <div className="shrink-0 rounded-full bg-primary-100 p-1">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-white">
                        <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Orientation dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setOrientationOpen(prev => !prev);
              setModelOpen(false);
            }}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-black-40 bg-black-100 px-6 py-3 text-sm font-medium text-white-50 transition-colors hover:border-primary-100"
          >
            {t('orientation_label')}
            <span className="text-white">{orientation}</span>
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
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 text-xs font-medium transition-colors ${opt.boxW} ${opt.boxH} ${orientation === opt.value ? 'border-primary-100 text-primary-100' : 'border-white text-white-75 hover:border-white-50'}`}
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
        label={isGenerating ? t('generating') : t('generate_image')}
        coins={activeModel.coins}
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!reference || !visual || isUploading}
      />

      {visualModalOpen && (
        <SelectVisualModal
          onSelect={(v) => {
            setVisual(v);
            setVisualModalOpen(false);
          }}
          onClose={() => setVisualModalOpen(false)}
        />
      )}
      {needsSignUp && (
        <SignUpPromptModal
          description="Sign up to generate scenes — your creations will be saved to your account."
          onClose={dismissSignUpPrompt}
        />
      )}
    </div>
  );
};
