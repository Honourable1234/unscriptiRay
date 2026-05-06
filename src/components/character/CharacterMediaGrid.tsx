import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { PadlockIcon, PlayIcon } from '@/components/icons';

type MediaItem = { type: 'image' | 'video'; url: string; locked: boolean };

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

const VideoItem = (props: { url: string; isLocked: boolean; onReveal: () => void }) => {
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
    <div className="group relative aspect-[3/4] max-w-80 min-w-60 flex-1 overflow-hidden rounded-xl">
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

export const CharacterMediaGrid = (props: { name: string; media: MediaItem[]; isPremium: boolean }) => (
  <div className="flex flex-wrap gap-2.5">
    {props.media.map((item) => {
      const isLocked = !props.isPremium && item.locked;
      if (item.type === 'video') {
        return (
          <VideoItem
            key={item.url}
            url={item.url}
            isLocked={isLocked}
            onReveal={() => {}}
          />
        );
      }
      return (
        <div key={item.url} className="group relative aspect-[3/4] max-w-80 min-w-60 flex-1 overflow-hidden rounded-xl">
          <Image
            src={item.url}
            alt={props.name}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className={`object-cover ${isLocked ? 'blur-sm brightness-50' : ''}`}
          />
          {isLocked && <LockedOverlay onReveal={() => {}} />}
        </div>
      );
    })}
  </div>
);
