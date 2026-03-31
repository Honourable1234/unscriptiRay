'use client';

import type { Character } from '@/data/characters';
import { useState } from 'react';
import { SearchBar } from '@/components/general/SearchBar';
import { characters } from '@/data/characters';
import { SelectableCharacterCard } from './SelectableCharacterCard';
import { SelectedCharacterBar } from './SelectedCharacterBar';

const MAX = 10;

export const NewGroupView = () => {
  const [groupName, setGroupName] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Character[]>([]);

  const filtered = characters
    .slice(0, 12)
    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  const toggle = (character: Character) => {
    setSelected(prev =>
      prev.find(c => c.id === character.id)
        ? prev.filter(c => c.id !== character.id)
        : prev.length < MAX ? [...prev, character] : prev,
    );
  };

  return (
    <div className="flex flex-col">
      <div className="px-1 pb-4">
        <label htmlFor="group-name" className="mb-2 block text-sm font-medium text-white">Give your group a name</label>
        <input
          id="group-name"
          type="text"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          placeholder="MyGroup"
          className="w-full rounded-xl border border-white-25 bg-black-60 px-4 py-3 text-sm text-white placeholder-white-75 focus:outline-none"
        />
      </div>

      <h1 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl md:text-[32px]">
        Who do you want to add to the group?
      </h1>

      <SearchBar hideFilter onChange={setQuery} />

      <div className="mt-6 flex flex-wrap gap-2">
        {filtered.map(character => (
          <SelectableCharacterCard
            key={character.id}
            character={character}
            selected={!!selected.find(c => c.id === character.id)}
            onClick={() => toggle(character)}
          />
        ))}
      </div>

      <SelectedCharacterBar
        selected={selected}
        onRemove={id => setSelected(prev => prev.filter(c => c.id !== id))}
        onCreate={() => {}}
      />
    </div>
  );
};
