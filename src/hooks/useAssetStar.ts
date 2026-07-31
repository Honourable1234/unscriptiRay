'use client';

import { useEffect, useState } from 'react';
import { useCharacterService } from '@/services/useCharacterService';

type StarCharacter = { id: string; name: string; image: string };

/**
 * Resolves the star an asset was generated from so a scene action modal opens
 * with it already picked, while leaving the choice editable.
 * @param characterId - Character stored on the asset, when it had one.
 * @returns The selected star and its setter, in `useState` order.
 */
export const useAssetStar = (characterId: string | null) => {
  const { getCharacter } = useCharacterService();
  const [star, setStar] = useState<StarCharacter | null>(null);

  useEffect(() => {
    if (!characterId) {
      return;
    }
    getCharacter(characterId).then((res) => {
      const character = res?.content;
      if (character) {
        setStar({ id: character.id, name: character.name, image: character.image_url ?? '' });
      }
    }).catch(() => {});
  }, [characterId]);

  return [star, setStar] as const;
};
