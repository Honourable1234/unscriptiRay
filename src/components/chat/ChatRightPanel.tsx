'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MediaIcon,
  MemoryIcon,
  ModelIcon,
  OpenIcon,
  PhoneIcon,
  SettingsIcon,
  VoiceIcon,
} from '@/components/icons';

const panelImages = [
  '/General/GojoSatoru.png',
  '/General/GojoSatoru2.png',
  '/General/GojoSatoru3.png',
  '/General/GojoSatoru4.png',
];

const settingsRows = [
  { label: 'Model', icon: <ModelIcon /> },
  { label: 'Voice', icon: <VoiceIcon /> },
  { label: 'Memory', icon: <MemoryIcon /> },
  { label: 'Settings', icon: <SettingsIcon /> },
];

export const ChatRightPanel = (props: {
  name: string;
  image: string;
  onClose: () => void;
}) => {
  const [imgIndex, setImgIndex] = useState(0);

  const prev = () => setImgIndex(i => (i - 1 + panelImages.length) % panelImages.length);
  const next = () => setImgIndex(i => (i + 1) % panelImages.length);

  return (
    <div className="relative h-full w-full max-w-100 flex-shrink-0 overflow-y-auto bg-black-100 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        onClick={props.onClose}
        className="absolute top-3 left-3 z-20 flex w-fit cursor-pointer items-center justify-center rounded-full bg-black-60/50 p-2 text-white hover:bg-black/60"
      >
        <OpenIcon />
      </button>
      <div className="flex flex-col">
        <div className="relative aspect-[14/15] w-full flex-shrink-0 overflow-hidden">
          <Image src={panelImages[imgIndex] ?? panelImages[0]!} alt={props.name} fill className="object-cover" />
          <button
            onClick={prev}
            className="absolute top-1/2 left-2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black-60/50 text-white hover:bg-black/60"
          >
            <span className="[&>svg]:h-[18px] [&>svg]:w-[15px]"><ChevronLeftIcon /></span>
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black-60/50 text-white hover:bg-black/60"
          >
            <span className="[&>svg]:h-[18px] [&>svg]:w-[15px]"><ChevronRightIcon /></span>
          </button>
          <div className="absolute bottom-3 flex w-full items-center justify-center">
            <span className="rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {imgIndex + 1}
              {' / '}
              {panelImages.length}
            </span>
          </div>
        </div>
        <div className="mt-6 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {panelImages.map((src, i) => (
            <button
              key={src}
              onClick={() => setImgIndex(i)}
              className={`relative h-21.5 w-19 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors ${imgIndex === i ? 'border-primary-100' : 'border-transparent'}`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
        <div className="mt-6 px-4">
          <span className="font-semibold text-white">{props.name}</span>
          <span className="ml-2 text-white-75">28</span>
        </div>
        <div className="mt-6 flex gap-2 px-4">
          <button className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-primary-100 px-1 py-2.5 text-xs font-semibold text-primary-100 sm:px-3">
            <MediaIcon />
            View Media
          </button>
          <button className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-black-20 px-1 py-2.5 text-xs font-semibold text-white sm:px-3">
            <PhoneIcon />
            Call Me
          </button>
        </div>
        <div className="mt-6 flex flex-col">
          {settingsRows.map(row => (
            <button
              key={row.label}
              className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm text-white hover:bg-black-40"
            >
              <span className="flex items-center gap-2">
                {row.icon}
                {row.label}
              </span>
              <span className="h-6 w-6 overflow-hidden [&>svg]:h-6 [&>svg]:w-3">
                <ChevronRightIcon />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
