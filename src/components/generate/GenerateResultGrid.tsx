'use client';

import type { GeneratedAssetsResponse } from '@/services/generateService';
import Image from 'next/image';
import Link from 'next/link';
import { generatePlaceholders } from './generatePlaceholders';

export const GenerateResultGrid = (props: { assets: GeneratedAssetsResponse['content'] | null }) => {
  const items = props.assets
    ? [...props.assets.images, ...props.assets.videos]
    : [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-center text-xs text-white/40">No generated scenes yet — here are some samples</p>
        <div className="flex flex-wrap gap-2">
          {generatePlaceholders.map(p => (
            <Link
              key={p.id}
              href={`/generate/scene/${p.id}`}
              className="relative h-77.5 max-w-75 min-w-65 flex-1 cursor-pointer overflow-hidden rounded-2xl"
            >
              <Image src={p.src} alt={p.name} fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              <span className="absolute bottom-3 left-3 text-xs font-semibold text-white/60">Sample</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <Link
          key={item.id}
          href={`/generate/scene/${item.id}`}
          className="relative h-77.5 max-w-75 min-w-65 flex-1 cursor-pointer overflow-hidden rounded-2xl"
        >
          <Image src={item.url} alt="Generated scene" fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        </Link>
      ))}
    </div>
  );
};
