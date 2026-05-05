'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useGenerateService } from '@/services/generateService';
import { GenerateButton } from './GenerateButton';

const resolutions = ['HD', '1K', '4K'];

export const EnhanceContent = (props: { imageSrc: string; imageName?: string; assetId: string; onSuccess?: () => void }) => {
  const { enhanceGeneratedImage, pollGenerationStatus } = useGenerateService();
  const [resolution, setResolution] = useState('HD');
  const [isGenerating, setIsGenerating] = useState(false);
  const stopPollRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stopPollRef.current?.();
    };
  }, []);

  const handleGenerate = async () => {
    stopPollRef.current?.();
    setIsGenerating(true);
    try {
      const res = await enhanceGeneratedImage(props.assetId) as { success: boolean; content: { generation_id: string; status: string } };
      toast.info('Enhancement started, processing...');
      stopPollRef.current = pollGenerationStatus(
        res.content.generation_id,
        () => {
          setIsGenerating(false);
          toast.success('Enhancement complete!');
          props.onSuccess?.();
        },
        (errorMsg) => {
          setIsGenerating(false);
          toast.error(errorMsg);
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Enhancement failed.';
      toast.error(message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Image */}
      <div className="relative w-full max-w-xs overflow-hidden rounded-xl">
        <Image src={props.imageSrc} alt={props.imageName ?? 'Scene'} width={313} height={386} className="w-full rounded-xl object-cover" />
        {props.imageName && (
          <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-3">
            <p className="text-center text-sm font-medium text-white">{props.imageName}</p>
          </div>
        )}
      </div>

      {/* Resolution */}
      <div className="flex max-w-80 flex-col items-center gap-3 text-center">
        <p className="text-sm font-semibold text-white">Enhance the resolution of your scene</p>
        <div className="flex items-center gap-2">
          {resolutions.map(r => (
            <button
              key={r}
              onClick={() => setResolution(r)}
              className={`cursor-pointer rounded-lg px-3 py-1 text-sm font-medium transition-colors ${resolution === r ? 'bg-primary-100 text-white' : 'bg-black-60 text-white-75 hover:bg-black-40'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <GenerateButton
        label={isGenerating ? 'Enhancing...' : 'Enhance Scene'}
        coins={10}
        onClick={handleGenerate}
        isLoading={isGenerating || !props.assetId}
        py="py-2"
        px="px-4"
        textSize="text-xs"
      />
    </div>
  );
};
