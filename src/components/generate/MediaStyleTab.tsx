'use client';

import { useState } from 'react';
import { AllIcon, FilterIcon2, PictureIcon, VideoIcon } from '@/components/icons';

type Tab = 'All' | 'Images' | 'Videos';

export const MediaStyleTab = () => {
  const [tab, setTab] = useState<Tab>('All');

  return (
    <div className="mb-4 flex items-center justify-between pb-2">
      <div className="flex gap-4">
        {(['All', 'Images', 'Videos'] as Tab[]).map(t => (
          <button
            key={t}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${tab === t ? 'border-primary-100 text-primary-100' : 'border-black-40 text-white hover:bg-black-60'}`}
            onClick={() => setTab(t)}
          >
            {t === 'All' && <AllIcon />}
            {t === 'Images' && <PictureIcon />}
            {t === 'Videos' && <VideoIcon />}
            {t}
          </button>
        ))}
      </div>
      <button className="hidden cursor-pointer items-center gap-1 text-sm text-white sm:flex">
        <FilterIcon2 />
        Filter
      </button>
    </div>
  );
};
