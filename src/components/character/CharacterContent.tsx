'use client';

import type { Character } from '@/data/characters';
import type { CharacterMediaItem } from '@/services/useCharacterService';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { MediaStyleTab } from '@/components/generate/MediaStyleTab';
import { assetAspectRatio } from '@/services/generateService';
import { useCharacterService } from '@/services/useCharacterService';
import { CharacterContentSkeleton } from './CharacterContentSkeleton';
import { CharacterHeader } from './CharacterHeader';
import { CharacterMediaGrid } from './CharacterMediaGrid';
import { CharacterUnlockButton } from './CharacterUnlockButton';

type Tab = 'All' | 'Images' | 'Videos';
type MediaItem = { type: 'image' | 'video'; url: string; locked: boolean; aspectRatio: string };

/**
 * Checks whether a value is a src `next/image` can render: an absolute URL or a root-relative path.
 * @param src - Candidate media source, e.g. an `image_url` from the API.
 * @returns True when `next/image` will accept it without throwing.
 */
const isRenderableSrc = (src: string) => /^(?:https?:\/\/|\/)/.test(src);

export const CharacterContent = (props: { id: string }) => {
  const t = useTranslations('CharacterContent');
  const { getCharacter, getCharacterMedia } = useCharacterService();
  const [character, setCharacter] = useState<Character | null>(null);
  // The character payload reports whether this viewer owns the collection.
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [imageCount, setImageCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [tab, setTab] = useState<Tab>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const handleUnlocked = () => setReloadKey(k => k + 1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect
    setLoading(true);

    const characterReq = getCharacter(props.id).then((res) => {
      const c = res?.content;
      if (c) {
        setCharacter({
          id: c.id,
          name: c.name,
          age: c.age,
          gender: c.gender,
          description: c.short_bio,
          image: c.image_url,
          likes: String(c.like_count),
          comments: String(c.total_chats),
          tags: c.tags ?? [],
        });
      }
    });

    const parseMedia = (items: CharacterMediaItem[] | undefined, type: 'image' | 'video'): MediaItem[] =>
      (items ?? []).map((item): MediaItem | null => {
        const aspectRatio = assetAspectRatio({
          width: item.width ?? null,
          height: item.height ?? null,
          orientation: item.orientation ?? null,
        });
        // A locked item arrives without its real asset, leaving only the blur.
        const source = type === 'video' ? item.video_url : item.image_url;
        const url = source ?? item.blur_url ?? null;
        if (!url || !isRenderableSrc(url)) {
          return null;
        }
        return { type, url, locked: item.locked ?? !source, aspectRatio };
      }).filter((m): m is MediaItem => m !== null);

    const imagesReq = getCharacterMedia(props.id, 'images');
    const videosReq = getCharacterMedia(props.id, 'videos');

    const mediaReq = Promise.all([imagesReq, videosReq]).then(([imageRes, videoRes]) => {
      const imgs = parseMedia(imageRes?.content?.items, 'image');
      const vids = parseMedia(videoRes?.content?.items, 'video');
      const sorted = [
        ...imgs.filter(m => !m.locked),
        ...vids.filter(m => !m.locked),
        ...imgs.filter(m => m.locked),
        ...vids.filter(m => m.locked),
      ];
      setAllMedia(sorted);
      setImageCount(imgs.length);
      setVideoCount(vids.length);
      // The media endpoint, not the character one, reports collection ownership.
      setHasFullAccess(imageRes?.content?.hasFullAccess === true || videoRes?.content?.hasFullAccess === true);
    });

    Promise.all([characterReq, mediaReq])
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [props.id, reloadKey]);

  if (loading) {
    return <CharacterContentSkeleton />;
  }

  if (error || !character) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-white-50">{t('error')}</p>
      </div>
    );
  }

  const filtered = allMedia.filter((m) => {
    if (tab === 'Images') {
      return m.type === 'image';
    }
    if (tab === 'Videos') {
      return m.type === 'video';
    }
    return true;
  });

  return (
    <div className="w-full py-2.5">
      <CharacterHeader character={character} imageCount={imageCount} videoCount={videoCount} />
      {!hasFullAccess && <CharacterUnlockButton character={character} onUnlocked={handleUnlocked} />}
      <MediaStyleTab tab={tab} onTabChange={setTab} />
      <CharacterMediaGrid name={character.name} media={filtered} />
    </div>
  );
};
