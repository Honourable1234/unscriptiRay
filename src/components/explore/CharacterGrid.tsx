'use client';

import type { Character } from '@/data/characters';
import { useState } from 'react';
import { CharacterCard } from './CharacterCard';
import { CharacterModal } from './CharacterModal';

export const CharacterGrid = (props: { characters: Character[] }) => {
  const [selected, setSelected] = useState<Character | null>(null);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {props.characters.map(character => (
          <CharacterCard
            key={character.id}
            character={character}
            onClick={() => setSelected(character)}
          />
        ))}
      </div>

      {selected !== null && (
        <CharacterModal character={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
};
