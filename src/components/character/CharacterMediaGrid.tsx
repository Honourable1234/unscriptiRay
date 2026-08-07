import Image from 'next/image';
import { useEffect, useState } from 'react';
import { PadlockIcon, PlayIcon } from '@/components/icons';
import { CharacterMediaViewer } from './CharacterMediaViewer';

type MediaItem = { id: string; type: 'image' | 'video'; url: string; locked: boolean; aspectRatio: string };

const LockedOverlay = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <PadlockIcon />
  </div>
);

const LoadingPlaceholder = () => (
  <div className="absolute inset-0 animate-pulse bg-black-60" />
);

const VideoItem = (props: { url: string; aspectRatio: string; isLocked: boolean; isLoaded: boolean; onOpen: () => void; onLoad: () => void; onError: () => void }) => (
  <div style={{ aspectRatio: props.aspectRatio }} className="group relative overflow-hidden rounded-xl">
    {!props.isLoaded && <LoadingPlaceholder />}
    <video
      src={props.url}
      className={`h-full w-full object-cover transition-opacity duration-200 ${props.isLoaded ? 'opacity-100' : 'opacity-0'} ${props.isLocked ? 'blur-sm brightness-50' : ''}`}
      muted
      playsInline
      // Without an explicit preload, some browsers defer fetching until
      // play() is called, so a broken source stays visible (and silent)
      // until someone clicks it. Forcing metadata load surfaces the error
      // as soon as the tile renders.
      preload="metadata"
      // Metadata loading successfully is the earliest confirmation the
      // source is actually a playable video, so the tile only reveals
      // itself once that fires — never a raw/broken frame first.
      onLoadedMetadata={props.onLoad}
      onError={props.onError}
    />
    {props.isLoaded && !props.isLocked && (
      <button className="absolute inset-0 flex items-center justify-center" onClick={props.onOpen}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50">
          <PlayIcon />
        </div>
      </button>
    )}
    {props.isLoaded && props.isLocked && <LockedOverlay />}
  </div>
);

const MediaCard = (props: { name: string; item: MediaItem; isLocked: boolean; isLoaded: boolean; onOpen: () => void; onLoad: () => void; onError: () => void }) => {
  if (props.item.type === 'video') {
    return (
      <VideoItem
        url={props.item.url}
        aspectRatio={props.item.aspectRatio}
        isLocked={props.isLocked}
        isLoaded={props.isLoaded}
        onOpen={props.onOpen}
        onLoad={props.onLoad}
        onError={props.onError}
      />
    );
  }
  return (
    <div
      role={props.isLocked ? undefined : 'button'}
      tabIndex={props.isLocked ? undefined : 0}
      style={{ aspectRatio: props.item.aspectRatio }}
      className={`group relative overflow-hidden rounded-xl ${props.isLocked ? '' : 'cursor-pointer'}`}
      onClick={props.isLocked ? undefined : props.onOpen}
      onKeyDown={(e) => {
        if (!props.isLocked && (e.key === 'Enter' || e.key === ' ')) {
          props.onOpen();
        }
      }}
    >
      {!props.isLoaded && <LoadingPlaceholder />}
      <Image
        src={props.item.url}
        alt={props.name}
        fill
        sizes="(max-width: 640px) 100vw, 320px"
        className={`object-cover transition-opacity duration-200 ${props.isLoaded ? 'opacity-100' : 'opacity-0'} ${props.isLocked ? 'blur-sm brightness-50' : ''}`}
        onLoad={props.onLoad}
        onError={props.onError}
      />
      {props.isLoaded && props.isLocked && <LockedOverlay />}
    </div>
  );
};

const relativeHeight = (aspectRatio: string) => {
  const [width, height] = aspectRatio.split('/').map(n => Number.parseFloat(n));
  return width && height ? height / width : 1;
};

/**
 * Tracks the masonry column count, mirroring the `columns-2 md:columns-3
 * xl:columns-4` breakpoints so the JS-packed layout matches the old CSS one.
 */
const useColumnCount = () => {
  const [count, setCount] = useState(2);
  useEffect(() => {
    const mdQuery = window.matchMedia('(min-width: 768px)');
    const xlQuery = window.matchMedia('(min-width: 1280px)');
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    const update = () => setCount(xlQuery.matches ? 4 : mdQuery.matches ? 3 : 2);
    update();
    mdQuery.addEventListener('change', update);
    xlQuery.addEventListener('change', update);
    return () => {
      mdQuery.removeEventListener('change', update);
      xlQuery.removeEventListener('change', update);
    };
  }, []);
  return count;
};

// CSS multi-column layout fills one column at a time, so a sorted list (e.g.
// unlocked media before locked) clusters into whichever columns fill first
// instead of reading top-to-bottom. Packing into the shortest column keeps
// the masonry look while preserving that order across the whole grid.
const packColumns = (media: MediaItem[], columnCount: number) => {
  const columns: MediaItem[][] = Array.from({ length: columnCount }, () => []);
  const heights = Array.from({ length: columnCount }, () => 0);
  media.forEach((item) => {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest]?.push(item);
    heights[shortest] = (heights[shortest] ?? 0) + relativeHeight(item.aspectRatio);
  });
  return columns;
};

export const CharacterMediaGrid = (props: { name: string; media: MediaItem[] }) => {
  const columnCount = useColumnCount();
  // A broken asset URL still renders its overlay with nothing behind it, so
  // items that fail to load are dropped instead of left showing.
  const [failedIds, setFailedIds] = useState<Set<string>>(() => new Set());
  // Tiles stay behind a loading placeholder until confirmed loadable, so a
  // broken item never flashes real (or broken) content before it's dropped.
  const [loadedIds, setLoadedIds] = useState<Set<string>>(() => new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const visibleMedia = props.media.filter(item => !failedIds.has(item.id));
  const columns = packColumns(visibleMedia, columnCount);
  const loadedMedia = visibleMedia.filter(item => loadedIds.has(item.id));

  return (
    <div className="flex gap-2.5">
      {columns.map((column, index) => (
        // Columns are a fixed-size structural layout, not a reorderable data
        // list, so the positional key is stable and intentional.
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className="flex flex-1 flex-col gap-2.5">
          {column.map(item => (
            <MediaCard
              key={item.id}
              name={props.name}
              item={item}
              // The API withholds the real asset and sends only a blur when an
              // item is locked, so its own flag decides the treatment.
              isLocked={item.locked}
              isLoaded={loadedIds.has(item.id)}
              onOpen={() => setActiveId(item.id)}
              onLoad={() => setLoadedIds(prev => new Set(prev).add(item.id))}
              onError={() => setFailedIds(prev => new Set(prev).add(item.id))}
            />
          ))}
        </div>
      ))}

      {activeId && (
        <CharacterMediaViewer
          name={props.name}
          media={loadedMedia}
          activeId={activeId}
          onClose={() => setActiveId(null)}
          onSelect={setActiveId}
        />
      )}
    </div>
  );
};
