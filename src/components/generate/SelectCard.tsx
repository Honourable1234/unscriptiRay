'use client';

import type { Character } from '@/data/characters';
import Image from 'next/image';

export const SelectCard = (props: { character: Character; onClick?: () => void; priority?: boolean }) => {
  return (
    <div
      className="relative h-65 max-w-50 min-w-40 flex-1 cursor-pointer overflow-hidden rounded-2xl"
      role="button"
      tabIndex={0}
      onClick={props.onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') props.onClick?.();
      }}
    >
      {props.character.image && (
        <Image src={props.character.image} alt={props.character.name} fill sizes="200px" priority={props.priority} className="object-cover" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute right-0 bottom-0 left-0 p-2.5 text-center">
        <span className="text-sm font-semibold text-white">{props.character.name}</span>
      </div>
    </div>
  );
};
