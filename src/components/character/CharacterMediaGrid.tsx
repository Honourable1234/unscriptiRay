import Image from 'next/image';
import { useRef, useState } from 'react';
import { PadlockIcon, PlayIcon } from '@/components/icons';

type MediaItem = { type: 'image' | 'video'; url: string; locked: boolean; aspectRatio: string };

const LockedOverlay = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <PadlockIcon />
  </div>
);

const VideoItem = (props: { url: string; aspectRatio: string; isLocked: boolean }) => {
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
      {props.isLocked && <LockedOverlay />}
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
      {props.isLocked && <LockedOverlay />}
    </div>
  );
};

export const CharacterMediaGrid = (props: { name: string; media: MediaItem[] }) => (
  // CSS columns keep the masonry balanced at every width without measuring the
  // container, so cards flow on into the next column instead of stacking in one.
  <div className="columns-2 gap-2.5 md:columns-3 xl:columns-4">
    {props.media.map(item => (
      <div key={item.url} className="mb-2.5 break-inside-avoid">
        <MediaCard
          name={props.name}
          item={item}
          // The API withholds the real asset and sends only a blur when an
          // item is locked, so its own flag decides the treatment.
          isLocked={item.locked}
        />
      </div>
    ))}
  </div>
);
