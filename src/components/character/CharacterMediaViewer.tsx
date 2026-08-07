'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { CloseIcon, VideoIcon } from '@/components/icons';

type MediaItem = { id: string; type: 'image' | 'video'; url: string; locked: boolean; aspectRatio: string };

export const CharacterMediaViewer = (props: {
  name: string;
  media: MediaItem[];
  activeId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}) => {
  const active = props.media.find(item => item.id === props.activeId);
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [props.activeId]);

  if (!active) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <button
        onClick={props.onClose}
        className="absolute top-4 left-4 z-10 cursor-pointer rounded-full bg-black-60 p-1 text-white"
      >
        <CloseIcon />
      </button>

      <div className="flex min-h-0 flex-1 items-center justify-center px-2 py-5">
        {active.type === 'video'
          ? (
              <video
                key={active.id}
                src={active.url}
                controls
                autoPlay
                playsInline
                style={{ aspectRatio: active.aspectRatio }}
                className="max-h-full w-full max-w-105 rounded-lg object-contain"
              >
                <track kind="captions" />
              </video>
            )
          : (
              <div
                style={{ aspectRatio: active.aspectRatio }}
                className="relative max-h-full w-full max-w-105 overflow-hidden rounded-lg"
              >
                <Image src={active.url} alt={props.name} fill className="object-contain" sizes="512px" />
              </div>
            )}
      </div>

      {props.media.length > 1 && (
        <div className="overflow-x-auto pb-6 [scrollbar-width:none] sm:absolute sm:top-4 sm:right-4 sm:bottom-4 sm:left-auto sm:max-h-[calc(100dvh-2rem)] sm:overflow-x-hidden sm:overflow-y-auto sm:pb-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2 px-4 sm:flex-col sm:px-0">
            {props.media.map(item => (
              <button
                key={item.id}
                ref={active.id === item.id ? activeThumbRef : undefined}
                onClick={() => props.onSelect(item.id)}
                className={`relative h-39 w-31 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors ${active.id === item.id ? 'border-primary-100' : 'border-transparent'}`}
              >
                {item.type === 'video'
                  ? (
                      <>
                        <video src={`${item.url}#t=0.1`} preload="metadata" muted playsInline className="h-full w-full bg-black-60 object-cover">
                          <track kind="captions" />
                        </video>
                        <span className="absolute right-1.5 bottom-1.5 rounded-full bg-black-60 p-1 text-white">
                          <VideoIcon />
                        </span>
                      </>
                    )
                  : <Image src={item.url} alt={props.name} fill className="object-cover" sizes="124px" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
