'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { ApiError } from '@/libs/api';
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
  const t = useTranslations('GenerationToasts');
  const { isAuthenticated } = useAuth();
  const { refresh: refreshWallet } = useWallet();
  const { pollGenerationStatus, retryGeneration } = useGenerateService();
  const [isGenerating, setIsGenerating] = useState(false);
  const [needsSignUp, setNeedsSignUp] = useState(false);
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
        toast.success(options?.successMessage ?? t('complete'));
        refreshWallet();
        options?.onComplete?.();
      },
      (message) => {
        setIsGenerating(false);
        options?.onSettled?.(generationId);
        // Sonner has no click target on the toast body, so the retry is an action button.
        toast.error(message, {
          action: {
            label: t('retry'),
            onClick: () => {
              setIsGenerating(true);
              retryGeneration(generationId)
                .then((res) => {
                  toast.info(t('restarted'));
                  options?.onStart?.(res.content.generation_id);
                  track(res.content.generation_id, options);
                })
                .catch((error) => {
                  setIsGenerating(false);
                  toast.error(error instanceof Error ? error.message : t('retry_failed'));
                });
            },
          },
        });
      },
    );
  };

  const start = async (
    request: () => Promise<{ content: { generation_id: string } }>,
    options?: RunOptions,
  ) => {
    if (!isAuthenticated) {
      setNeedsSignUp(true);
      return;
    }
    stopPollRef.current?.();
    setIsGenerating(true);
    try {
      const res = await request();
      toast.info(t('started'));
      // Coins are charged when the request is accepted, so the balance is stale
      // from here until the generation settles and it is read again.
      refreshWallet();
      options?.onStart?.(res.content.generation_id);
      track(res.content.generation_id, options);
    } catch (error) {
      setIsGenerating(false);
      // A 402 raises the buy-coins modal from the api layer, so it needs no toast here.
      if (error instanceof ApiError && error.status === 402) {
        return;
      }
      const message = error instanceof Error ? error.message : t('failed');
      toast.error(message);
    }
  };

  return { isGenerating, needsSignUp, dismissSignUpPrompt: () => setNeedsSignUp(false), start };
};
