import type { Character } from '@/data/characters';
import { HeartIcon, PictureIcon, VideoIcon } from '@/components/icons';

export const CharacterStats = (props: { character: Character; imageCount?: number; videoCount?: number }) => (
  <div className="flex items-center gap-4 text-xs text-white">
    <div className="flex items-center gap-1">
      <HeartIcon />
      <span>{props.character.likes}</span>
    </div>
    <div className="flex items-center gap-1">
      <PictureIcon />
      <span>{props.imageCount ?? 0}</span>
    </div>
    <div className="flex items-center gap-1">
      <VideoIcon />
      <span>{props.videoCount ?? 0}</span>
    </div>
  </div>
);
