'use client';

import type { Character } from '@/data/characters';
import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/general/SearchBar';
import { useCharacterService } from '@/services/useCharacterService';
import { useExploreService } from '@/services/useExploreService';
import { mapCharacter } from '@/utils/mapCharacter';
import { SelectableCharacterCard } from './SelectableCharacterCard';
import { SelectedCharacterBar } from './SelectedCharacterBar';

const MAX = 10;

export const SelectCharactersView = (props: {
  preSelectedId?: string;
  heading: string;
  extraField: React.ReactNode;
  createLabel?: string;
}) => {
  const { getCharacters } = useExploreService();
  const { getCharacter } = useCharacterService();
  const [query, setQuery] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selected, setSelected] = useState<Character[]>([]);

  useEffect(() => {
    getCharacters().then((res) => {
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
    getCharacter(props.preSelectedId).then((res) => {
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
        {props.extraField}
      </div>

      <h1 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl md:text-[32px]">
        {props.heading}
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
        createLabel={props.createLabel}
        disabled
      />
    </div>
  );
};
