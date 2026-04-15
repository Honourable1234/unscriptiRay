'use client';

import type { Character } from '@/data/characters';
import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/general/SearchBar';
import { api } from '@/libs/api';
import { SelectableCharacterCard } from './SelectableCharacterCard';
import { SelectedCharacterBar } from './SelectedCharacterBar';

const MAX = 10;

const mapCharacter = (c: Record<string, unknown>): Character => ({
  id: c.id as string,
  name: c.name as string,
  age: c.age as number,
  gender: c.gender as 'Male' | 'Female',
  description: (c.short_bio ?? '') as string,
  image: (c.image_url ?? '') as string,
  likes: String(c.like_count ?? 0),
  comments: String(c.total_chats ?? 0),
  tags: (c.tags as string[]) ?? [],
});

export const NewGroupView = (props: { preSelectedId?: string }) => {
  const [groupName, setGroupName] = useState('');
  const [query, setQuery] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selected, setSelected] = useState<Character[]>([]);

  useEffect(() => {
    api.get('/explore/characters').then((res) => {
      const list: unknown = res?.content?.characters ?? res?.content ?? res?.data ?? res;
      if (Array.isArray(list)) {
        setCharacters(list.map(c => mapCharacter(c as Record<string, unknown>)));
      }
    });
  }, []);

  useEffect(() => {
    if (!props.preSelectedId) {
      return;
    }
    api.get(`/characters/${props.preSelectedId}`).then((res) => {
      const c = res?.content;
      if (c) {
        setSelected([mapCharacter(c as Record<string, unknown>)]);
      }
    });
  }, [props.preSelectedId]);

  const filtered = characters.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

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
            key={String(character.id)}
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
