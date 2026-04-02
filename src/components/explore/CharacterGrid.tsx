'use client';

import type { Character } from '@/data/characters';
import { useState } from 'react';
import { CharacterCard } from './CharacterCard';
import { CharacterModal } from './CharacterModal';

export const CharacterGrid = (props: { characters: Character[]; onCharacterClick?: (character: Character) => void }) => {
  const [selected, setSelected] = useState<Character | null>(null);

  const handleClick = (character: Character) => {
    if (props.onCharacterClick) {
      props.onCharacterClick(character);
    } else {
      setSelected(character);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {props.characters.map(character => (
          <CharacterCard
            key={character.id}
            character={character}
            onClick={() => handleClick(character)}
          />
        ))}
      </div>

      {selected !== null && (
        <CharacterModal character={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
};
