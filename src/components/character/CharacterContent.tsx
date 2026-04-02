'use client';

import type { Character } from '@/data/characters';
import { MediaStyleTab } from '@/components/generate/MediaStyleTab';
import { useAuth } from '@/context/AuthContext';
import { CharacterHeader } from './CharacterHeader';
import { CharacterImageGrid } from './CharacterImageGrid';
import { CharacterUnlockButton } from './CharacterUnlockButton';

export const CharacterContent = (props: { character: Character }) => {
  const { isPremium } = useAuth();

  return (
    <div className="w-full py-2.5">
      <CharacterHeader character={props.character} />
      {!isPremium && <CharacterUnlockButton character={props.character} />}
      <MediaStyleTab />
      <CharacterImageGrid name={props.character.name} />
    </div>
  );
};
