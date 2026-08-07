'use client';

import type { Character } from '@/data/characters';
import type { CharacterMediaItem } from '@/services/useCharacterService';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { MediaStyleTab } from '@/components/generate/MediaStyleTab';
import { useAuth } from '@/context/AuthContext';
import { assetAspectRatio } from '@/services/generateService';
import { useCharacterService } from '@/services/useCharacterService';
import { isCharacterOwner } from '@/utils/characterOwner';
import { CharacterContentSkeleton } from './CharacterContentSkeleton';
import { CharacterHeader } from './CharacterHeader';
import { CharacterManageBar } from './CharacterManageBar';
import { CharacterMediaGrid } from './CharacterMediaGrid';
import { CharacterUnlockButton } from './CharacterUnlockButton';

type Tab = 'All' | 'Images' | 'Videos';
type MediaItem = { id: string; type: 'image' | 'video'; url: string; locked: boolean; aspectRatio: string };

/**
 * Checks whether a value is a src `next/image` can render: an absolute URL or a root-relative path.
 * @param src - Candidate media source, e.g. an `image_url` from the API.
 * @returns True when `next/image` will accept it without throwing.
 */
const isRenderableSrc = (src: string) => /^(?:https?:\/\/|\/)/.test(src);

export const CharacterContent = (props: { id: string }) => {
  const t = useTranslations('CharacterContent');
  const { authLoading, user } = useAuth();
  const { getCharacter, getCharacterMedia } = useCharacterService();
  const [character, setCharacter] = useState<Character | null>(null);
  // Only the creator may manage a character, and the API reports that as a handle.
  const [creator, setCreator] = useState<string | null>(null);
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
    // Fetching before the session resolves reads as anonymous, which hides a
    // character the viewer owns, so the skeleton stays up until the token lands.
    if (authLoading) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect
    setLoading(true);

    const characterReq = getCharacter(props.id).then((res) => {
      const c = res?.content;
      if (c) {
        setCreator(c.creator ?? null);
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

    const parseMedia = (items: CharacterMediaItem[] | undefined, bucket: 'image' | 'video'): MediaItem[] =>
      (items ?? []).map((item): MediaItem | null => {
        const aspectRatio = assetAspectRatio({
          width: item.width ?? null,
          height: item.height ?? null,
          orientation: item.orientation ?? null,
        });
        // The `type=images`/`type=videos` query param is a request to the
        // API, not a guarantee about what comes back, so classify by which
        // URL the item actually has rather than trusting the bucket it
        // arrived in — otherwise a leaked video renders (and filters) as
        // an image, or vice versa.
        const type: 'image' | 'video' = item.video_url ? 'video' : item.image_url ? 'image' : bucket;
        // Locked items commonly share one generic placeholder `blur_url`
        // across many assets, so the item's own id (not the URL) is what
        // keeps each tile distinct across renders.
        const id = `${type}-${item.id}`;
        const source = type === 'video' ? item.video_url : item.image_url;
        const locked = item.locked || !source;
        if (locked) {
          // A locked item must never render its real (permission-gated)
          // asset — some still carry a populated source URL, but fetching
          // that directly 403s for anyone who hasn't unlocked it. If there
          // is no blur preview to show instead (common for videos, which
          // often have no blurred preview asset at all), there is nothing
          // safe to render, so the item is dropped rather than shown
          // pointing at a URL that will fail.
          if (!item.blur_url || !isRenderableSrc(item.blur_url)) {
            return null;
          }
          return { id, type, url: item.blur_url, locked, aspectRatio };
        }
        if (!source || !isRenderableSrc(source)) {
          return null;
        }
        return { id, type, url: source, locked, aspectRatio };
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
  }, [props.id, reloadKey, authLoading]);

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
      {isCharacterOwner({ creator, username: user?.username }) && <CharacterManageBar id={String(character.id)} />}
      {!hasFullAccess && <CharacterUnlockButton character={character} onUnlocked={handleUnlocked} />}
      <MediaStyleTab tab={tab} onTabChange={setTab} />
      <CharacterMediaGrid name={character.name} media={filtered} />
    </div>
  );
};
