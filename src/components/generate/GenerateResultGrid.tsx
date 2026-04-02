'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { generatePlaceholders } from './generatePlaceholders';

export const GenerateResultGrid = () => {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {generatePlaceholders.map(item => (
        <button
          key={item.id}
          onClick={() => router.push(`/generate/scene/${item.id}`)}
          className="relative h-77.5 max-w-75 min-w-65 flex-1 cursor-pointer overflow-hidden rounded-2xl"
        >
          <Image src={item.src} alt="Generated scene" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </button>
      ))}
    </div>
  );
};
