'use client';
import type { Character } from '@/data/characters';

export const CharacterDescription = (props: { character: Character }) => {
  return (
    <div className="mb-4">
      <p className="text-sm leading-relaxed text-white-75">
        {props.character.description}
      </p>
    </div>
  );
};
