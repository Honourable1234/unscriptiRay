'use client';

import type { Character } from '@/data/characters';
import Image from 'next/image';
import { useState } from 'react';
import { HeartIcon, HeartIconFilled } from '@/components/icons';
import { api } from '@/libs/api';

export const CharacterCard = (props: { character: Character; onClick?: () => void; showLike?: boolean; priority?: boolean; token?: string | null }) => {
  const token = props.token ?? null;
  const [likes, setLikes] = useState(Number(props.character.likes) || 0);
  const [liked, setLiked] = useState(props.character.is_liked ?? false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikes(n => n - 1);
      api.delete(`/characters/${props.character.id}/like`, token ?? undefined)
        .catch(() => {
          setLiked(true);
          setLikes(n => n + 1);
        });
    } else {
      setLiked(true);
      setLikes(n => n + 1);
      api.post(`/characters/${props.character.id}/like`, {}, token ?? undefined)
        .catch(() => {
          setLiked(false);
          setLikes(n => n - 1);
        });
    }
  };

  return (
    <div
      className="relative h-77.5 max-w-75 min-w-65 flex-1 cursor-pointer overflow-hidden rounded-2xl"
      role="button"
      tabIndex={0}
      onClick={props.onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') props.onClick?.();
      }}
    >
      {props.character.image && (
        <Image src={props.character.image} alt={props.character.name} fill sizes="(max-width: 640px) 100vw, 300px" priority={props.priority} className="object-cover" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute right-0 bottom-0 left-0 space-y-2 p-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-white">{props.character.name}</span>
          <span className="font-medium text-white">{props.character.age}</span>
        </div>

        <p className="line-clamp-2 text-xs font-medium text-white">{props.character.description}</p>

        <div className="flex items-center gap-4 pt-1">
          {props.showLike && (
            <button
              onClick={handleLike}
              className={`group flex cursor-pointer items-center gap-1 transition-colors ${liked ? 'text-primary-100' : 'text-white hover:text-primary-100'}`}
            >
              {liked ? <HeartIconFilled /> : <HeartIcon />}
              <span className="text-sm font-medium">{likes}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
