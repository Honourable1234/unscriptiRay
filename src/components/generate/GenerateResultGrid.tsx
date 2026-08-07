'use client';

import type { Asset, GeneratedAssetsResponse } from '@/services/generateService';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SpinnerIcon } from '@/components/icons';
import { assetAspectRatio } from '@/services/generateService';

type Card = { kind: 'pending'; id: string; orientation: string } | { kind: 'asset'; asset: Asset };

/** Narrowest a column may get before the grid drops to fewer columns. */
const columnMinWidth = 260;

// Images and videos are separate backend collections with independently
// numbered ids, so an image and a video can share the same `asset.id` —
// namespace by type to keep them distinct.
const assetKey = (asset: Asset) => `${asset.type}-${asset.id}`;
const cardKey = (card: Card) => card.kind === 'pending' ? `pending-${card.id}` : assetKey(card.asset);

const LoadingPlaceholder = () => (
  <div className="absolute inset-0 animate-pulse bg-black-60" />
);

const ResultCard = (props: { card: Card; isLoaded: boolean; onLoad: () => void; onError: () => void }) => {
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
      {!props.isLoaded && <LoadingPlaceholder />}
      {asset.type === 'video'
        // Metadata loading successfully is the earliest confirmation the
        // source is actually a playable video, so the tile only reveals
        // itself once that fires — never a raw/broken frame first.
        ? (
            <video
              src={asset.url}
              muted
              playsInline
              preload="metadata"
              className={`h-full w-full object-cover transition-opacity duration-200 ${props.isLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoadedMetadata={props.onLoad}
              onError={props.onError}
            />
          )
        : (
            <Image
              src={asset.url}
              alt={t('scene_alt')}
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              className={`object-cover transition-opacity duration-200 ${props.isLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={props.onLoad}
              onError={props.onError}
            />
          )}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
    </Link>
  );
};

export const GenerateResultGrid = (props: {
  assets: GeneratedAssetsResponse['content'] | null;
  pending?: { id: string; orientation: string }[];
}) => {
  const t = useTranslations('GenerateResultGrid');
  // A callback ref (rather than useRef + a mount-only effect) so the
  // ResizeObserver reattaches whenever this div (re)mounts — it disappears
  // behind the "no scenes" message whenever a tab has zero items, e.g.
  // switching to Videos with none yet, then back to Images.
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [columnCount, setColumnCount] = useState(1);
  // A broken asset URL still renders its overlay with nothing behind it, so
  // items that fail to load are dropped instead of left showing.
  const [failedIds, setFailedIds] = useState<Set<string>>(() => new Set());
  // Tiles stay behind a loading placeholder until confirmed loadable, so a
  // broken item never flashes real (or broken) content before it's dropped.
  const [loadedIds, setLoadedIds] = useState<Set<string>>(() => new Set());
  const pending = props.pending ?? [];
  const items = props.assets
    ? [...props.assets.images, ...props.assets.videos].filter(asset => !failedIds.has(assetKey(asset)))
    : [];

  useEffect(() => {
    if (!container) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0;
      setColumnCount(Math.max(1, Math.floor(width / columnMinWidth)));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [container]);

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
    <div ref={setContainer} className="flex items-start gap-2">
      {columns.map(column => (
        <div key={column.position} className="flex min-w-0 flex-1 flex-col gap-2">
          {column.cards.map(card => (
            <ResultCard
              key={cardKey(card)}
              card={card}
              isLoaded={card.kind === 'pending' ? true : loadedIds.has(assetKey(card.asset))}
              onLoad={() => {
                if (card.kind === 'asset') {
                  setLoadedIds(prev => new Set(prev).add(assetKey(card.asset)));
                }
              }}
              onError={() => {
                if (card.kind === 'asset') {
                  setFailedIds(prev => new Set(prev).add(assetKey(card.asset)));
                }
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
