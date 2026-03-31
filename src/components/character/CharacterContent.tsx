'use client';

import type { Character } from '@/data/characters';
import { useAuth } from '@/context/AuthContext';
import { CharacterHeader } from './CharacterHeader';
import { CharacterImageGrid } from './CharacterImageGrid';
import { CharacterTabs } from './CharacterTabs';
import { CharacterUnlockButton } from './CharacterUnlockButton';

export const CharacterContent = (props: { character: Character }) => {
  const { isPremium } = useAuth();

  return (
    <div className="w-full py-2.5">
      <CharacterHeader character={props.character} />
      {!isPremium && <CharacterUnlockButton character={props.character} />}
      <CharacterTabs />
      <CharacterImageGrid name={props.character.name} />
    </div>
  );
};
