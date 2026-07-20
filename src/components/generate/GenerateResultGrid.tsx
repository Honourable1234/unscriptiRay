'use client';

import type { GeneratedAssetsResponse } from '@/services/generateService';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { SpinnerIcon } from '@/components/icons';

export const GenerateResultGrid = (props: {
  assets: GeneratedAssetsResponse['content'] | null;
  pendingIds?: string[];
}) => {
  const t = useTranslations('GenerateResultGrid');
  const pendingIds = props.pendingIds ?? [];
  const items = props.assets
    ? [...props.assets.images, ...props.assets.videos]
    : [];

  if (items.length === 0 && pendingIds.length === 0) {
    return (
      <p className="py-12 text-center text-xs text-white/40">{t('no_scenes')}</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {pendingIds.map(id => (
        <div
          key={id}
          className="flex h-77.5 max-w-75 min-w-65 flex-1 animate-pulse flex-col items-center justify-center gap-3 rounded-2xl border border-black-40 bg-black-60"
        >
          <span className="animate-spin text-premium-100">
            <SpinnerIcon />
          </span>
          <span className="text-xs text-white-75">{t('generating')}</span>
        </div>
      ))}
      {items.map(item => (
        <Link
          key={item.id}
          href={`/generate/scene/${item.id}`}
          className="relative h-77.5 max-w-75 min-w-65 flex-1 cursor-pointer overflow-hidden rounded-2xl"
        >
          {item.type === 'video'
            ? <video src={item.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
            : <Image src={item.url} alt={t('scene_alt')} fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover" />}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        </Link>
      ))}
    </div>
  );
};
