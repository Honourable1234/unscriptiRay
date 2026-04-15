'use client';

import type { Character } from '@/data/characters';
import { useEffect, useState } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { MediaStyleTab } from '@/components/generate/MediaStyleTab';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';
import { CharacterHeader } from './CharacterHeader';
import { CharacterMediaGrid } from './CharacterMediaGrid';
import { CharacterUnlockButton } from './CharacterUnlockButton';

type Tab = 'All' | 'Images' | 'Videos';
type MediaItem = { type: 'image' | 'video'; url: string; locked: boolean };

export const CharacterContent = (props: { id: string }) => {
  const { isPremium, token } = useAuth();
  const [character, setCharacter] = useState<Character | null>(null);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [tab, setTab] = useState<Tab>('All');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const handleUnlocked = () => setReloadKey(k => k + 1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect
    setLoading(true);

    const characterReq = api.get(`/characters/${props.id}`).then((res) => {
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

    const imagesReq = api.get(`/characters/${props.id}/media?type=images`, token ?? undefined).then((res) => {
      return parseMedia(res?.content?.items ?? res?.content ?? res?.data ?? res, 'image');
    });

    const videosReq = api.get(`/characters/${props.id}/media?type=videos`, token ?? undefined).then((res) => {
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
    });

    Promise.all([characterReq, mediaReq]).finally(() => setLoading(false));
  }, [props.id, token, reloadKey]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <BouncingDots />
      </div>
    );
  }

  if (!character) {
    return null;
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
      <CharacterHeader character={character} />
      {!isPremium && <CharacterUnlockButton character={character} onUnlocked={handleUnlocked} />}
      <MediaStyleTab tab={tab} onTabChange={setTab} />
      <CharacterMediaGrid name={character.name} media={filtered} isPremium={isPremium} />
    </div>
  );
};
