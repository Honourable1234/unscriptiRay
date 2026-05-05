'use client';

import type { Character } from '@/data/characters';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { NewGroupView } from '@/components/chat/NewGroupView';
import { NewScenarioView } from '@/components/chat/NewScenarioView';
import { CharacterGrid } from '@/components/explore/CharacterGrid';
import { BouncingDots } from '@/components/general/BouncingDots';
import { SearchBar } from '@/components/general/SearchBar';
import { useChatNavigation } from '@/context/ChatContext';
import { createExploreService } from '@/services/useExploreService';

const ChatView = () => {
  const router = useRouter();
  const { getCharacters } = createExploreService();
  const [query, setQuery] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    getCharacters().then((res) => {
      const list: unknown = res?.content?.characters ?? res?.content ?? res?.data ?? res;
      if (Array.isArray(list)) {
        setCharacters((list as Record<string, unknown>[]).map(c => ({
          id: c.id as string,
          name: c.name as string,
          age: c.age as number,
          gender: c.gender as 'Male' | 'Female',
          description: (c.short_bio ?? '') as string,
          image: (c.image_url ?? '') as string,
          likes: String(c.like_count ?? 0),
          comments: String(c.total_chats ?? 0),
          tags: (c.tags as string[]) ?? [],
        })));
      }
    });
  }, []);

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
