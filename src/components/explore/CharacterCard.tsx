import type { Character } from '@/data/characters';
import Image from 'next/image';
import { CommentIcon, HeartIcon } from '@/components/icons';

export const CharacterCard = (props: { character: Character }) => {
  return (
    <div className="relative h-77.5 max-w-75 min-w-65 flex-1 cursor-pointer overflow-hidden rounded-2xl">
      <Image
        src={props.character.image}
        alt={props.character.name}
        fill
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute right-0 bottom-0 left-0 space-y-2 p-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-white">{props.character.name}</span>
          <span className="font-medium text-white">{props.character.age}</span>
        </div>

        <p className="line-clamp-2 text-xs font-medium text-white">{props.character.description}</p>

        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center gap-1 text-white">
            <HeartIcon />
            <span className="text-sm font-medium">{props.character.likes}</span>
          </div>

          <div className="flex items-center gap-1 text-white">
            <CommentIcon />
            <span className="text-sm font-medium">{props.character.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
