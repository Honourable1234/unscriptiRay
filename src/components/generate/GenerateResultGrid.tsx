'use client';

import type { Asset, GeneratedAssetsResponse } from '@/services/generateService';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SpinnerIcon } from '@/components/icons';
import { assetAspectRatio } from '@/services/generateService';

type Card = { kind: 'pending'; id: string; orientation: string } | { kind: 'asset'; asset: Asset };

/** Narrowest a column may get before the grid drops to fewer columns. */
const columnMinWidth = 260;

const ResultCard = (props: { card: Card }) => {
  const t = useTranslations('GenerateResultGrid');

  if (props.card.kind === 'pending') {
    return (
      <div
        style={{ aspectRatio: assetAspectRatio({ width: null, height: null, orientation: props.card.orientation }) }}
        className="flex animate-pulse flex-col items-center justify-center gap-3 rounded-2xl border border-black-40 bg-black-60"
      >
        <span className="animate-spin text-premium-100">
          <SpinnerIcon />
        </span>
        <span className="text-xs text-white-75">{t('generating')}</span>
      </div>
    );
  }

  const { asset } = props.card;

  return (
    <Link
      href={`/generate/scene/${asset.id}`}
      style={{ aspectRatio: assetAspectRatio(asset) }}
      className="relative block cursor-pointer overflow-hidden rounded-2xl"
    >
      {asset.type === 'video'
        ? <video src={asset.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
        : <Image src={asset.url} alt={t('scene_alt')} fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover" />}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
    </Link>
  );
};

export const GenerateResultGrid = (props: {
  assets: GeneratedAssetsResponse['content'] | null;
  pending?: { id: string; orientation: string }[];
}) => {
  const t = useTranslations('GenerateResultGrid');
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(1);
  const pending = props.pending ?? [];
  const items = props.assets
    ? [...props.assets.images, ...props.assets.videos]
    : [];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0;
      setColumnCount(Math.max(1, Math.floor(width / columnMinWidth)));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  if (items.length === 0 && pending.length === 0) {
    return (
      <p className="py-12 text-center text-xs text-white/40">{t('no_scenes')}</p>
    );
  }

  const cards: Card[] = [
    ...pending.map(p => ({ kind: 'pending' as const, id: p.id, orientation: p.orientation })),
    ...items.map(asset => ({ kind: 'asset' as const, asset })),
  ];

  // Cards are dealt across the columns in order, so reading left to right and
  // top to bottom keeps the API ordering while each column packs tightly.
  const columns = Array.from({ length: columnCount }, (_, column) => ({
    position: column,
    cards: cards.filter((_, index) => index % columnCount === column),
  }));

  return (
    <div ref={containerRef} className="flex items-start gap-2">
      {columns.map(column => (
        <div key={column.position} className="flex min-w-0 flex-1 flex-col gap-2">
          {column.cards.map(card => (
            <ResultCard key={card.kind === 'pending' ? card.id : card.asset.id} card={card} />
          ))}
        </div>
      ))}
    </div>
  );
};
