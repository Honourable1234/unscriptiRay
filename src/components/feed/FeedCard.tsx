'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { CommentIcon, HeartIcon, HeartIconFilled, ShareIcon } from '@/components/icons';
import { useFeedService } from '@/services/useFeedService';

export type DiscoverItem = {
  id: string;
  video_url: string;
  type: 'video';
  width: number;
  height: number;
  character: { id: string; name: string; image_url: string };
};

export const FeedCard = (props: { item: DiscoverItem; index: number }) => {
  const { likeAsset, unlikeAsset } = useFeedService();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [muted, setMuted] = useState(true);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    const video = videoRef.current;
    if (!card || !video) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          video.muted = false;
          video.play().catch(() => {
            video.muted = true;
            setMuted(true);
            video.play().catch(() => {});
          });
          setMuted(false);
        } else {
          video.pause();
          video.currentTime = 0;
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(n => n - 1);
      unlikeAsset(props.item.id).catch(() => {
        setLiked(true);
        setLikeCount(n => n + 1);
      });
    } else {
      setLiked(true);
      setLikeCount(n => n + 1);
      likeAsset(props.item.id).catch(() => {
        setLiked(false);
        setLikeCount(n => n - 1);
      });
    }
  };

  return (
    <div ref={cardRef} className="relative mx-auto h-full w-full max-w-lg shrink-0 snap-start snap-always overflow-hidden bg-black-100 px-4">
      <video
        ref={videoRef}
        src={props.item.video_url}
        loop
        muted={muted}
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <track kind="captions" />
      </video>

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />

      {/* Character info */}
      <div className="absolute right-20 bottom-8 left-4 flex items-center gap-3">
        {props.item.character.image_url && (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/40">
            <Image src={props.item.character.image_url} alt={props.item.character.name} fill sizes="40px" className="object-cover" />
          </div>
        )}
        <span className="text-base font-bold text-white drop-shadow">{props.item.character.name}</span>
      </div>

      {/* Right action bar */}
      <div className="absolute right-3 bottom-10 flex flex-col items-center gap-6">
        <button
          onClick={() => {
            const video = videoRef.current;
            if (video) {
              video.muted = !video.muted;
              setMuted(video.muted);
            }
          }}
          className="flex cursor-pointer flex-col items-center gap-1 text-white hover:text-primary-100"
        >
          {muted
            ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              )
            : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
          <span className="text-xs font-semibold">{muted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button
          onClick={handleLike}
          className={`flex cursor-pointer flex-col items-center gap-1 transition-colors ${liked ? 'text-primary-100' : 'text-white hover:text-primary-100'}`}
        >
          {liked ? <HeartIconFilled /> : <HeartIcon />}
          <span className="text-xs font-semibold">{likeCount}</span>
        </button>

        <button className="flex cursor-pointer flex-col items-center gap-1 text-white hover:text-primary-100">
          <CommentIcon />
          <span className="text-xs font-semibold">Chat</span>
        </button>

        <button
          onClick={() => {
            navigator.share?.({ url: window.location.href }).catch(() => {});
          }}
          className="flex cursor-pointer flex-col items-center gap-1 text-white hover:text-primary-100"
        >
          <ShareIcon />
          <span className="text-xs font-semibold">Share</span>
        </button>
      </div>
    </div>
  );
};
