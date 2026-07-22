'use client';

import type { Character } from '@/data/characters';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { MediaStyleTab } from '@/components/generate/MediaStyleTab';
import { useAuth } from '@/context/AuthContext';
import { useCharacterService } from '@/services/useCharacterService';
import { CharacterContentSkeleton } from './CharacterContentSkeleton';
import { CharacterHeader } from './CharacterHeader';
import { CharacterMediaGrid } from './CharacterMediaGrid';
import { CharacterUnlockButton } from './CharacterUnlockButton';

type Tab = 'All' | 'Images' | 'Videos';
type MediaItem = { type: 'image' | 'video'; url: string; locked: boolean };

export const CharacterContent = (props: { id: string }) => {
  const t = useTranslations('CharacterContent');
  const { isPremium } = useAuth();
  const { getCharacter, getCharacterMedia } = useCharacterService();
  const [character, setCharacter] = useState<Character | null>(null);
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

    const parseMedia = (items: unknown, type: 'image' | 'video'): MediaItem[] => {
      if (!Array.isArray(items)) {
        return [];
      }
      return (items as Record<string, unknown>[]).map((item): MediaItem | null => {
        const imageUrl = item.image_url as string | null;
        const videoUrl = item.video_url as string | null;
        const blurUrl = item.blur_url as string | null;
        if (type === 'video') {
          const url = videoUrl ?? blurUrl ?? null;
          if (!url) {
            return null;
          }
          return { type: 'video', url, locked: !videoUrl };
        }
        const url = imageUrl ?? blurUrl ?? null;
        if (!url) {
          return null;
        }
        return { type: 'image', url, locked: !imageUrl };
      }).filter((m): m is MediaItem => m !== null);
    };

    const imagesReq = getCharacterMedia(props.id, 'images').then((res) => {
      return parseMedia(res?.content?.items ?? res?.content ?? res?.data ?? res, 'image');
    });

    const videosReq = getCharacterMedia(props.id, 'videos').then((res) => {
      return parseMedia(res?.content?.items ?? res?.content ?? res?.data ?? res, 'video');
    });

    const mediaReq = Promise.all([imagesReq, videosReq]).then(([imgs, vids]) => {
      const sorted = [
        ...imgs.filter(m => !m.locked),
        ...vids.filter(m => !m.locked),
        ...imgs.filter(m => m.locked),
        ...vids.filter(m => m.locked),
      ];
      setAllMedia(sorted);
      setImageCount(imgs.length);
      setVideoCount(vids.length);
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
      {!isPremium && <CharacterUnlockButton character={character} onUnlocked={handleUnlocked} />}
      <MediaStyleTab tab={tab} onTabChange={setTab} />
      <CharacterMediaGrid name={character.name} media={filtered} isPremium={isPremium} />
    </div>
  );
};
