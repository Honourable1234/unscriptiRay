'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useGenerateService } from '@/services/generateService';

type RunOptions = {
  successMessage?: string;
  onComplete?: () => void;
  onStart?: (generationId: string) => void;
  onSettled?: (generationId: string) => void;
};

/**
 * Starts a generation request, polls its status until it finishes, and offers
 * a tap-to-retry toast backed by the retry endpoint when it fails.
 */
export const useGenerationRun = () => {
  const { pollGenerationStatus, retryGeneration } = useGenerateService();
  const [isGenerating, setIsGenerating] = useState(false);
  const stopPollRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => stopPollRef.current?.();
  }, []);

  const track = (generationId: string, options?: RunOptions) => {
    stopPollRef.current = pollGenerationStatus(
      generationId,
      () => {
        setIsGenerating(false);
        options?.onSettled?.(generationId);
        toast.success(options?.successMessage ?? 'Generation complete!');
        options?.onComplete?.();
      },
      (message) => {
        setIsGenerating(false);
        options?.onSettled?.(generationId);
        toast.error(`${message} — tap here to retry`, {
          onClick: () => {
            setIsGenerating(true);
            retryGeneration(generationId)
              .then((res) => {
                toast.info('Generation restarted, processing...');
                options?.onStart?.(res.content.generation_id);
                track(res.content.generation_id, options);
              })
              .catch((error) => {
                setIsGenerating(false);
                toast.error(error instanceof Error ? error.message : 'Retry failed.');
              });
          },
        });
      },
    );
  };

  const start = async (
    request: () => Promise<{ content: { generation_id: string } }>,
    options?: RunOptions,
  ) => {
    stopPollRef.current?.();
    setIsGenerating(true);
    try {
      const res = await request();
      toast.info('Generation started, processing...');
      options?.onStart?.(res.content.generation_id);
      track(res.content.generation_id, options);
    } catch (error) {
      setIsGenerating(false);
      const message = error instanceof Error ? error.message : 'Generation failed.';
      const isInsufficient = message.toLowerCase().includes('coin') || message.toLowerCase().includes('credit');
      toast.error(isInsufficient ? `Not enough coins. ${message}` : message);
    }
  };

  return { isGenerating, start };
};
