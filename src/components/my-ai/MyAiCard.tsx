'use client';

import type { MyCharacter } from '@/services/useMyAiService';
import Image from 'next/image';
import Link from 'next/link';
import { ChatIcon2, ProfileIcon } from '@/components/icons';

export const MyAiCard = (props: { character: MyCharacter; priority?: boolean }) => {
  const c = props.character;
  const total = c.image_count + c.video_count;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black-80">
      {/* Image */}
      <div className="relative h-116 w-full lg:h-136">
        {c.image_url
          ? (
              <Image
                src={c.image_url}
                alt={c.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={props.priority}
                className="object-cover"
              />
            )
          : (
              <div className="flex h-full w-full items-center justify-center bg-black-60">
                <span className="text-7xl font-bold text-white/20">{c.name[0]}</span>
              </div>
            )}

        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />

        {!c.is_approved && (
          <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1">
            <span className="text-xs font-medium text-white/60">Pending</span>
          </div>
        )}

        <div className="absolute right-0 bottom-0 left-0 flex items-center justify-between p-4">
          <div>
            <p className="text-base font-bold text-white">{c.name}</p>
            {c.short_bio && (
              <p className="line-clamp-2 text-xs text-white/60">
                {c.short_bio}
              </p>
            )}
            <p className="text-sm text-white/60">
              {c.age}
              {' · '}
              {c.style}
            </p>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2.5">

            {c.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {c.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-white/70">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-white/40">
              <span>
                {'♥ '}
                {c.like_count}
              </span>
              <span>
                {'💬 '}
                {c.total_chats}
              </span>
              <span>
                {'🎬 '}
                {total}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 p-4">
        <Link
          href={`/character/${c.id}`}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-black-20 py-3 text-sm font-semibold text-white"
        >
          <ProfileIcon />
          Profile
        </Link>
        <Link
          href={`/chat/${c.id}`}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-100 py-3 text-sm font-semibold text-white md:flex-2"
        >
          <ChatIcon2 />
          Chat
        </Link>
      </div>
    </div>
  );
};
