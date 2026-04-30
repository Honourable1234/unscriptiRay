'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

const resolutions = ['HD', '1K', '4K'];

export const EnhanceContent = (props: { imageSrc: string; imageName?: string }) => {
  const t = useTranslations('EnhanceContent');
  const [resolution, setResolution] = useState('HD');

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Image */}
      <div className="relative w-full max-w-xs overflow-hidden rounded-xl">
        <Image src={props.imageSrc} alt={props.imageName ?? 'Scene'} width={313} height={386} className="w-full rounded-xl object-cover" />
        {props.imageName && (
          <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="text-center text-sm font-medium text-white">{props.imageName}</p>
          </div>
        )}
      </div>

      {/* Description + resolution */}
      <div className="flex max-w-80 flex-col items-center gap-3 text-center">
        <p className="text-sm font-semibold text-white">{t('description')}</p>
        <div className="flex items-center gap-2">
          {resolutions.map(r => (
            <button
              key={r}
              onClick={() => setResolution(r)}
              className={`cursor-pointer rounded-lg px-3 py-1 text-sm font-medium transition-colors ${resolution === r ? 'bg-primary-100 text-white' : 'bg-black-60 text-white-75 hover:bg-black-40'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
