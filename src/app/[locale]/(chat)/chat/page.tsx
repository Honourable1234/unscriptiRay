'use client';

import type { Character } from '@/data/characters';
import { useState } from 'react';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { NewGroupView } from '@/components/chat/NewGroupView';
import { NewScenarioView } from '@/components/chat/NewScenarioView';
import { CharacterGrid } from '@/components/explore/CharacterGrid';
import { SearchBar } from '@/components/general/SearchBar';
import { useChat } from '@/context/ChatContext';
import { characters } from '@/data/characters';

const ChatView = () => {
  const { setActiveChat } = useChat();
  const [query, setQuery] = useState('');

  const filtered = characters
    .slice(0, 12)
    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <h1 className="mt-2.5 mb-10 text-center text-xl font-bold text-white sm:text-2xl md:text-[32px]">
        Who would you like to start with?
      </h1>
      <SearchBar hideFilter onChange={setQuery} />
      <div className="mt-6">
        <CharacterGrid
          characters={filtered}
          onCharacterClick={(c: Character) => setActiveChat({ name: c.name, image: c.image })}
        />
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { activeView, activeChat } = useChat();

  if (activeChat) {
    return <ChatRoom />;
  }

  if (activeView === 'group') {
    return <NewGroupView />;
  }
  if (activeView === 'scenario') {
    return <NewScenarioView />;
  }

  return <ChatView />;
}
