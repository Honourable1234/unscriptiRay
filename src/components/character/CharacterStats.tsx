import type { Character } from '@/data/characters';
import { HeartIcon, PictureIcon, VideoIcon } from '@/components/icons';

export const CharacterStats = (props: { character: Character }) => (
  <div className="flex items-center gap-4 text-xs text-white">
    <div className="flex items-center gap-1">
      <HeartIcon />
      <span>{props.character.likes}</span>
    </div>
    <div className="flex items-center gap-1">
      <PictureIcon />
      <span>31</span>
    </div>
    <div className="flex items-center gap-1">
      <VideoIcon />
      <span>12</span>
    </div>
  </div>
);
