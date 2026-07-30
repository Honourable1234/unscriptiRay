import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { PadlockIcon, PlayIcon } from '@/components/icons';

type MediaItem = { type: 'image' | 'video'; url: string; locked: boolean; aspectRatio: string };

/** Narrowest a column may get before the grid drops to fewer columns. */
const columnMinWidth = 260;

const LockedOverlay = (props: { onReveal: () => void }) => {
  const t = useTranslations('CharacterMediaGrid');
  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-700 group-hover:opacity-0">
        <PadlockIcon />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 transition-opacity duration-900 group-hover:opacity-100">
        <span className="text-lg font-semibold text-white">{t('secrets_locked')}</span>
        <button
          className="rounded-xl bg-gradient-to-r from-premium-100 to-primary-200 px-8 py-2 text-sm font-semibold text-white"
          onClick={props.onReveal}
        >
          {t('tap_to_reveal')}
        </button>
      </div>
    </>
  );
};

const VideoItem = (props: { url: string; aspectRatio: string; isLocked: boolean; onReveal: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) {
      return;
    }
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div style={{ aspectRatio: props.aspectRatio }} className="group relative overflow-hidden rounded-xl">
      <video
        ref={videoRef}
        src={props.url}
        className={`h-full w-full object-cover ${props.isLocked ? 'blur-sm brightness-50' : ''}`}
        loop
        muted
        playsInline
      />
      {!props.isLocked && !playing && (
        <button className="absolute inset-0 flex items-center justify-center" onClick={togglePlay}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50">
            <PlayIcon />
          </div>
        </button>
      )}
      {!props.isLocked && playing && (
        <button className="absolute inset-0" onClick={togglePlay} />
      )}
      {props.isLocked && <LockedOverlay onReveal={props.onReveal} />}
    </div>
  );
};

const MediaCard = (props: { name: string; item: MediaItem; isLocked: boolean }) => {
  if (props.item.type === 'video') {
    return (
      <VideoItem
        url={props.item.url}
        aspectRatio={props.item.aspectRatio}
        isLocked={props.isLocked}
        onReveal={() => {}}
      />
    );
  }
  return (
    <div style={{ aspectRatio: props.item.aspectRatio }} className="group relative overflow-hidden rounded-xl">
      <Image
        src={props.item.url}
        alt={props.name}
        fill
        sizes="(max-width: 640px) 100vw, 320px"
        className={`object-cover ${props.isLocked ? 'blur-sm brightness-50' : ''}`}
      />
      {props.isLocked && <LockedOverlay onReveal={() => {}} />}
    </div>
  );
};

export const CharacterMediaGrid = (props: { name: string; media: MediaItem[]; isPremium: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(1);

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

  // Cards are dealt across the columns in order, so reading left to right and
  // top to bottom keeps the ordering while each column packs tightly.
  const columns = Array.from({ length: columnCount }, (_, column) => ({
    position: column,
    items: props.media.filter((_, index) => index % columnCount === column),
  }));

  return (
    <div ref={containerRef} className="flex items-start gap-2.5">
      {columns.map(column => (
        <div key={column.position} className="flex min-w-0 flex-1 flex-col gap-2.5">
          {column.items.map(item => (
            <MediaCard
              key={item.url}
              name={props.name}
              item={item}
              isLocked={!props.isPremium && item.locked}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
