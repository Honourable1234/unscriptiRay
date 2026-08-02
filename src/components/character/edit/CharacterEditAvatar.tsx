'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { SparkleIcon, SpinnerIcon } from '@/components/icons';
import { useGenerateService } from '@/services/generateService';
import { useCharacterService } from '@/services/useCharacterService';
import { isValidImageSrc } from '@/utils/isValidImageSrc';

export const CharacterEditAvatar = (props: { id: string; name: string; imageUrl: string | null }) => {
  const t = useTranslations('CharacterEditAvatar');
  const { generateCharacterImage } = useCharacterService();
  const { pollGenerationStatus } = useGenerateService();
  const [imageUrl, setImageUrl] = useState(props.imageUrl);
  const [generating, setGenerating] = useState(false);
  const stopPollingRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopPollingRef.current?.(), []);

  const handleRegenerate = async () => {
    setGenerating(true);
    stopPollingRef.current?.();
    try {
      const res = await generateCharacterImage(props.id);
      stopPollingRef.current = pollGenerationStatus(
        res.content.generation_id,
        (result) => {
          setGenerating(false);
          if (result.url) {
            setImageUrl(result.url);
            toast.success(t('toast_ready'));
          } else {
            toast.error(t('toast_no_image'));
          }
        },
        (message) => {
          setGenerating(false);
          toast.error(message || t('toast_failed'));
        },
      );
    } catch (error) {
      setGenerating(false);
      // A rate limit (10 per minute) surfaces here with the API's own message.
      toast.error(error instanceof Error ? error.message : t('toast_start_failed'));
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-black-60 p-4">
      <div className="relative h-25 w-25 shrink-0 overflow-hidden rounded-xl bg-black-80">
        <Image
          src={isValidImageSrc(imageUrl) ? imageUrl : '/General/Profile.png'}
          alt={props.name}
          fill
          sizes="100px"
          className="object-cover"
        />
        {generating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <SpinnerIcon />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-white">{props.name}</span>
        <p className="text-xs text-white-75">{t('description')}</p>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={generating}
          className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-black-20 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-primary-100 hover:text-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SparkleIcon />
          {generating ? t('generating') : t('regenerate')}
        </button>
      </div>
    </div>
  );
};
