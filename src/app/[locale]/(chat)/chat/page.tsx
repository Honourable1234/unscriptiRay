'use client';

import type { Character } from '@/data/characters';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { NewGroupView } from '@/components/chat/NewGroupView';
import { NewScenarioView } from '@/components/chat/NewScenarioView';
import { CharacterGrid } from '@/components/explore/CharacterGrid';
import { BouncingDots } from '@/components/general/BouncingDots';
import { SearchBar } from '@/components/general/SearchBar';
import { useChatNavigation } from '@/context/ChatContext';
import { createExploreService } from '@/services/useExploreService';
import { mapCharacter } from '@/utils/mapCharacter';

const PAGE_SIZE = 20;

const ChatView = () => {
  const router = useRouter();
  const { getCharacters } = createExploreService();
  const [query, setQuery] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCharacters({ page: 1, limit: PAGE_SIZE }).then((res) => {
      const list: unknown = res?.content?.characters ?? res?.content ?? res?.data ?? res;
      const pagination = res?.content?.pagination as { pageCount?: number } | undefined;
      setPageCount(pagination?.pageCount ?? 1);
      if (Array.isArray(list)) {
        setCharacters((list as Record<string, unknown>[]).map(mapCharacter));
      }
    }).catch(() => {});
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    getCharacters({ page: nextPage, limit: PAGE_SIZE }).then((res) => {
      const list: unknown = res?.content?.characters ?? res?.content ?? res?.data ?? res;
      if (Array.isArray(list)) {
        const incoming = (list as Record<string, unknown>[]).map(mapCharacter);
        setCharacters((prev) => {
          const seen = new Set(prev.map(c => c.id));
          return [...prev, ...incoming.filter(c => !seen.has(c.id))];
        });
        setPage(nextPage);
      }
    }).catch(() => {}).finally(() => {
      setLoadingMore(false);
    });
  };

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loadingMore || page >= pageCount) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, pageCount, loadingMore]);

  const filtered = characters.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <h1 className="mt-2.5 mb-10 text-center text-xl font-bold text-white sm:text-2xl md:text-[32px]">
        Who would you like to start with?
      </h1>
      <SearchBar hideFilter onChange={setQuery} />
      <div className="mt-6">
        <CharacterGrid
          characters={filtered}
          onCharacterClick={(c: Character) => router.push(`/chat/${c.id}`)}
        />
      </div>
      {page < pageCount && (
        <div ref={sentinelRef} className="mt-6 flex justify-center py-4">
          {loadingMore && <span className="text-sm text-white-50">Loading…</span>}
        </div>
      )}
    </div>
  );
};

const ChatViewSelector = () => {
  const { activeView, activeChat } = useChatNavigation();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  const characterId = searchParams.get('characterId') ?? undefined;

  if (activeChat) {
    return <ChatRoom />;
  }

  if (viewParam === 'group' || activeView === 'group') {
    return <NewGroupView preSelectedId={characterId} />;
  }

  if (viewParam === 'scenario' || activeView === 'scenario') {
    return <NewScenarioView preSelectedId={characterId} />;
  }

  return <ChatView />;
};

export default function ChatPage() {
  return (
    <Suspense fallback={<BouncingDots />}>
      <ChatViewSelector />
    </Suspense>
  );
}
