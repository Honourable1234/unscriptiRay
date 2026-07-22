'use client';

import type { DiscoverItem } from './FeedCard';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FeedLimitError, useFeedService } from '@/services/useFeedService';
import { FeedCard } from './FeedCard';
import { FeedCardSkeleton } from './FeedCardSkeleton';
import { FeedPaywall } from './FeedPaywall';

export const FeedSection = () => {
  const { token } = useAuth();
  const { getDiscoverVideos } = useFeedService();
  const [items, setItems] = useState<DiscoverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [seed, setSeed] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const fetchPage = (cursor: string | null, currentSeed: string | null) => {
    if (loadingRef.current) {
      return;
    }
    loadingRef.current = true;
    getDiscoverVideos({ cursor: cursor ?? undefined, seed: currentSeed ?? undefined }).then((res) => {
      const incoming = res?.content?.items ?? [];
      const incomingCursor = res?.content?.nextCursor ?? null;
      const incomingSeed = res?.content?.seed ?? null;
      setItems(prev => [...prev, ...incoming]);
      setNextCursor(incomingCursor);
      if (!currentSeed && incomingSeed) {
        setSeed(incomingSeed);
      }
      setHasMore(!!incomingCursor);
    }).catch((err: unknown) => {
      if (err instanceof FeedLimitError) {
        setLimitReached(true);
        setHasMore(false);
      }
    }).finally(() => {
      loadingRef.current = false;
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPage(null, null);
  }, [token]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingRef.current) {
          fetchPage(nextCursor, seed);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, nextCursor, seed]);

  const visibleItems = items;
  const lastItem = visibleItems[visibleItems.length - 1];
  const paywallBg = lastItem?.character.image_url ?? null;

  if (loading && items.length === 0) {
    return (
      <div className="h-full">
        <FeedCardSkeleton />
      </div>
    );
  }

  return (
    <div className="-mx-4 h-full snap-y snap-mandatory overflow-y-scroll [scrollbar-width:none] sm:-mx-6 md:-mx-8 [&::-webkit-scrollbar]:hidden">
      {visibleItems.map((item, i) => (
        <FeedCard key={item.id} item={item} index={i} />
      ))}

      {limitReached && (
        <div className="relative h-full w-full shrink-0 snap-start snap-always overflow-hidden">
          {paywallBg && (
            <Image src={paywallBg} alt="background" fill sizes="100vw" className="scale-110 object-cover" />
          )}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
          <FeedPaywall />
        </div>
      )}

      {hasMore && (
        <div ref={sentinelRef} className="flex h-16 items-center justify-center">
          <p className="text-xs text-white/30">Loading more...</p>
        </div>
      )}
    </div>
  );
};
