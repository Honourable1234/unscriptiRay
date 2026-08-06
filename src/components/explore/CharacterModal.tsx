'use client';

import type { Character } from '@/data/characters';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import {
  CaptureIcon,
  ChatIcon2,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  FemaleIcon,
  HeartIcon2,
  MaleIcon,
  PictureIcon,
  ProfileIcon,
  VideoIcon,
} from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useCharacterService } from '@/services/useCharacterService';
import { CharacterModalSkeleton } from './CharacterModalSkeleton';

const MAX_TAGS_VISIBLE = 3;

/**
 * Checks whether a value is a src `next/image` can render: an absolute URL or a root-relative path.
 * @param src - Candidate image source, e.g. an `image_url` from the API.
 * @returns True when `next/image` will accept it without throwing.
 */
const isRenderableSrc = (src: string) => /^(?:https?:\/\/|\/)/.test(src);

export const CharacterModal = (props: {
  character: Character;
  onClose: () => void;
}) => {
  const t = useTranslations('CharacterModal');
  const { authLoading } = useAuth();
  const { getCharacter } = useCharacterService();
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [navClicks, setNavClicks] = useState(0);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const router = useRouter();
  const [detailImages, setDetailImages] = useState<string[]>([]);
  const [imageCount, setImageCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The character is only readable as its owner, so wait for the session.
    if (authLoading) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect
    setLoading(true);
    getCharacter(String(props.character.id)).then((res) => {
      const c = res?.content;
      if (c) {
        setImageCount((c.image_count as number) ?? 0);
        setVideoCount((c.video_count as number) ?? 0);
      }

      const seen = new Set<string>();
      const urls: string[] = [];
      const imgs: unknown = c?.character_images;
      if (Array.isArray(imgs)) {
        (imgs as { image_url: string | null; blur_url?: string | null }[]).forEach((i) => {
          const u = i.image_url ?? i.blur_url ?? null;
          if (u && isRenderableSrc(u) && !seen.has(u)) {
            seen.add(u);
            urls.push(u);
          }
        });
      }
      if (urls.length > 0) {
        setDetailImages(urls);
      }
    }).catch(() => {}).finally(() => {
      setLoading(false);
    });
  }, [props.character.id, authLoading]);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const node = descRef.current;
    if (!node) {
      return;
    }
    const observer = new ResizeObserver(() => {
      setIsClamped(node.scrollHeight > node.clientHeight);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const images = detailImages.length > 0 ? detailImages : [props.character.image];
  const tags = props.character.tags;
  const visibleTags = tags.slice(0, MAX_TAGS_VISIBLE);
  const extraCount = tags.length - MAX_TAGS_VISIBLE;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onClick={props.onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          props.onClose();
        }
      }}
    >
      <div
        role="presentation"
        className="relative w-full max-w-120 rounded-2xl border border-white-25 bg-black-80 pt-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black-40 hover:bg-black-100"
          onClick={props.onClose}
        >
          <CloseIcon />
        </button>

        {loading
          ? <CharacterModalSkeleton />
          : (
              <>
                {/* Header */}
                <div className="mb-3 flex items-center gap-2 px-4">
                  <span className="text-lg font-semibold text-white">{props.character.name}</span>
                  <span className="text-base font-medium text-white-75">{props.character.age}</span>
                  {props.character.gender === 'Male' ? <MaleIcon /> : <FemaleIcon />}
                </div>

                {/* Description */}
                <div className="mb-3 px-4">
                  <p ref={descRef} className={`text-xs leading-relaxed text-white-75 ${!expanded ? 'line-clamp-2' : ''}`}>
                    {props.character.description}
                  </p>
                  {(isClamped || expanded) && (
                    <button
                      className="mt-1 cursor-pointer text-xs font-semibold text-white hover:underline"
                      onClick={() => setExpanded(v => !v)}
                    >
                      {expanded ? t('show_less') : t('show_more')}
                    </button>
                  )}

                </div>

                {/* Stats */}
                <div className="mb-6 flex items-center gap-4 px-4 text-xs text-white-75">
                  <div className="flex items-center gap-[3px]">
                    <HeartIcon2 />
                    <span>{props.character.likes}</span>
                  </div>
                  <div className="flex items-center gap-[3px]">
                    <PictureIcon />
                    <span>{imageCount}</span>
                  </div>
                  <div className="flex items-center gap-[3px]">
                    <VideoIcon />
                    <span>{videoCount}</span>
                  </div>
                  <button
                    className="flex cursor-pointer items-center gap-[3px] hover:text-white"
                    onClick={() => {
                      setProfileLoading(true);
                      router.push(`/character/${props.character.id}`);
                    }}
                  >
                    <ProfileIcon />
                    {profileLoading ? <BouncingDots /> : <span>{t('profile')}</span>}
                  </button>
                </div>

                {/* Tags */}
                <div className="m-auto mb-6 flex w-fit gap-2">
                  {visibleTags.map(tag => (
                    <span
                      key={tag}
                      className="rounded-lg bg-black-40 p-3 text-xs font-medium text-white-75"
                    >
                      {tag}
                    </span>
                  ))}
                  {extraCount > 0 && (
                    <span className="rounded-lg p-3 text-xs font-medium text-white-75">
                      {t('more_tags', { count: extraCount })}
                    </span>
                  )}
                </div>
                <div className="relative mx-4 mb-8 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
                  <div className="absolute top-1/2 left-0 z-10 h-[76%] w-[49%] -translate-y-1/2 overflow-hidden rounded-3xl opacity-50">
                    <Image
                      src={images[(imageIndex - 1 + images.length) % images.length] ?? props.character.image}
                      alt={props.character.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover blur-[4px]"
                    />
                  </div>
                  <div className="relative z-20 mx-auto h-full w-[70%] overflow-hidden rounded-3xl">
                    <Image
                      src={images[imageIndex] ?? props.character.image}
                      alt={props.character.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className={`object-cover transition-all duration-300 ${navClicks >= 3 ? 'blur-[3px]' : ''}`}
                    />
                    <button
                      className="absolute top-1/2 -left-2.5 z-30 -translate-y-1/2 cursor-pointer"
                      onClick={() => {
                        setImageIndex(i => (i - 1 + images.length) % images.length);
                        setNavClicks(n => Math.max(n - 1, 0));
                      }}
                    >
                      <ChevronLeftIcon />
                    </button>
                    <button
                      className="absolute top-1/2 -right-2.5 z-30 -translate-y-1/2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={navClicks >= 3}
                      onClick={() => {
                        setImageIndex(i => (i + 1) % images.length);
                        setNavClicks(n => n + 1);
                      }}
                    >
                      <ChevronRightIcon />
                    </button>
                  </div>

                  {navClicks >= 3 && (
                    <div className="pointer-events-none absolute left-1/2 z-40 flex h-full w-[70%] -translate-x-1/2 flex-col items-center justify-center gap-[2px] rounded-lg">
                      <p className="text-sm font-bold text-white sm:text-[20px]">{t('want_more')}</p>
                      <Link href={`/character/${props.character.id}`} className="pointer-events-auto rounded-xl bg-primary-100 px-2 py-2 text-xs font-semibold text-white sm:px-8">
                        {t('view_content')}
                      </Link>
                    </div>
                  )}
                  <div className="absolute top-1/2 right-0 z-10 h-[76%] w-[41%] -translate-y-1/2 overflow-hidden rounded-3xl opacity-50">
                    <Image
                      src={images[(imageIndex + 1) % images.length] ?? props.character.image}
                      alt={props.character.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover blur-[4px]"
                    />
                  </div>
                </div>
                <div className="flex gap-3 border-t border-black-40 p-4">
                  <button
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-black-20 py-3 text-sm font-semibold text-white"
                    disabled={generateLoading}
                    onClick={() => {
                      setGenerateLoading(true);
                      const params = new URLSearchParams({
                        characterId: String(props.character.id),
                        characterName: props.character.name,
                        characterImage: images[imageIndex] ?? props.character.image,
                      });
                      router.push(`/generate?${params.toString()}`);
                    }}
                  >
                    <CaptureIcon />
                    {generateLoading ? <BouncingDots /> : t('generate')}
                  </button>
                  <button
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-100 py-3 text-sm font-semibold text-white md:flex-2"
                    disabled={chatLoading}
                    onClick={() => {
                      setChatLoading(true);
                      router.push(`/chat/${props.character.id}`);
                    }}
                  >
                    <ChatIcon2 />
                    {chatLoading ? <BouncingDots /> : t('chat')}
                  </button>
                </div>
              </>
            )}
      </div>
    </div>
  );
};
