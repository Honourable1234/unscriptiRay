'use client';

import type { GeneratedAssetsResponse } from '@/services/generateService';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const GenerateResultGrid = (props: { assets: GeneratedAssetsResponse['content'] }) => {
  const router = useRouter();
  const items = [...props.assets.images, ...props.assets.videos];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => router.push(`/generate/scene/${item.id}`)}
          className="relative h-77.5 max-w-75 min-w-65 flex-1 cursor-pointer overflow-hidden rounded-2xl"
        >
          <Image src={item.url} alt="Generated scene" fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </button>
      ))}
    </div>
  );
};
