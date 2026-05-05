'use client';

import type { GenerateMode, GenerateType } from '@/components/generate/GenerateTypeToggle';
import type { GeneratedAssetsResponse } from '@/services/generateService';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GenerateResultGrid } from '@/components/generate/GenerateResultGrid';
import { GenerateTypeToggle } from '@/components/generate/GenerateTypeToggle';
import { MediaStyleTab } from '@/components/generate/MediaStyleTab';
import { AnimatedExtendVideo } from '@/components/generate/modes/AnimatedExtendVideo';
import { AnimatedImageToVideo } from '@/components/generate/modes/AnimatedImageToVideo';
import { AnimatedStylePresent } from '@/components/generate/modes/AnimatedStylePresent';
import { AnimatedTalking } from '@/components/generate/modes/AnimatedTalking';
import { StillEditStyle } from '@/components/generate/modes/StillEditStyle';
import { StillStylePresent } from '@/components/generate/modes/StillStylePresent';
import { useAuth } from '@/context/AuthContext';
import { useGenerateService } from '@/services/generateService';

type Tab = 'All' | 'Images' | 'Videos';

export default function GeneratePage() {
  const t = useTranslations('GeneratePage');
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const { getGeneratedAssets } = useGenerateService();

  const characterId = searchParams.get('characterId') ?? '';
  const characterName = searchParams.get('characterName') ?? '';
  const characterImage = searchParams.get('characterImage') ?? '';
  const initialCharacter = characterId ? { id: characterId, name: characterName, image: characterImage } : null;

  const [activeType, setActiveType] = useState<GenerateType>('still');
  const [mode, setMode] = useState<GenerateMode>('style_present');
  const [mediaTab, setMediaTab] = useState<Tab>('All');
  const [assets, setAssets] = useState<GeneratedAssetsResponse['content'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await getGeneratedAssets();
        if (res.success) {
          setAssets(res.content);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [token]);

  const filteredAssets = assets
    ? {
        images: mediaTab === 'Videos' ? [] : assets.images,
        videos: mediaTab === 'Images' ? [] : assets.videos,
        pagination: assets.pagination,
      }
    : null;

  const modeComponent = activeType === 'still'
    ? mode === 'edit_style'
      ? <StillEditStyle />
      : <StillStylePresent initialCharacter={initialCharacter} />
    : mode === 'image_to_video'
      ? <AnimatedImageToVideo />
      : mode === 'extend_video'
        ? <AnimatedExtendVideo />
        : mode === 'talking'
          ? <AnimatedTalking />
          : <AnimatedStylePresent initialCharacter={initialCharacter} />;

  return (
    <div className="space-y-6 py-6">
      <h1 className="text-center text-xl font-bold text-white sm:text-2xl md:text-[32px]">
        {t('title')}
        {' '}
        <span className="text-primary-100">{t('title_highlight')}</span>
      </h1>
      <div className="mx-auto max-w-184">
        <GenerateTypeToggle
          active={activeType}
          mode={mode}
          onChange={setActiveType}
          onModeChange={setMode}
        />
        {modeComponent}
      </div>
      <MediaStyleTab tab={mediaTab} onTabChange={setMediaTab} />
      {isLoading
        ? <div className="flex justify-center py-12"><span className="text-sm text-white/50">Loading...</span></div>
        : <GenerateResultGrid assets={filteredAssets} />}
    </div>
  );
}
