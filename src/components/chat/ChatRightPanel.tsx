'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ChevronDownIcon,
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
import { useAuth } from '@/context/AuthContext';
import { useChatNavigation } from '@/context/ChatContext';
import { api } from '@/libs/api';
import { ChatMemoryPanel } from './ChatMemoryPanel';
import { ChatSettingsPanel } from './ChatSettingsPanel';

export const ChatRightPanel = (props: {
  name: string;
  image: string;
  onClose: () => void;
}) => {
  const t = useTranslations('ChatRightPanel');
  const { activeChat } = useChatNavigation();
  const { token } = useAuth();
  const router = useRouter();
  const [imgIndex, setImgIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [age, setAge] = useState<number | null>(null);
  const [settingsOpenId, setSettingsOpenId] = useState<string | null>(null);
  const [memoryOpenId, setMemoryOpenId] = useState<string | null>(null);
  const settingsOpen = settingsOpenId === activeChat?.chatroomId;
  const memoryOpen = memoryOpenId === activeChat?.chatroomId;

  useEffect(() => {
    if (!activeChat?.characterId) {
      return;
    }

    api.get(`/characters/${activeChat.characterId}`).then((res) => {
      const c = res?.content;
      if (c?.age) {
        setAge(c.age as number);
      }
    }).catch(() => {});

    api.get(`/characters/${activeChat.characterId}/media?type=images`, token ?? undefined).then((res) => {
      const items: unknown = res?.content?.items;
      if (Array.isArray(items)) {
        const urls = (items as Record<string, unknown>[])
          .map(i => (i.image_url ?? i.blur_url) as string | null)
          .filter((u): u is string => !!u);
        if (urls.length > 0) {
          setImages(urls);
        }
      }
    }).catch(() => {});
  }, [activeChat?.characterId, token]);

  const displayImages = images.length > 0 ? images : [props.image];
  const prev = () => setImgIndex(i => (i - 1 + displayImages.length) % displayImages.length);
  const next = () => setImgIndex(i => (i + 1) % displayImages.length);

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
          <Image src={displayImages[imgIndex] ?? props.image} alt={props.name} fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" />
          <button onClick={prev} className="absolute top-1/2 left-2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black-60/50 text-white hover:bg-black/60">
            <span className="[&>svg]:h-[18px] [&>svg]:w-[15px]"><ChevronLeftIcon /></span>
          </button>
          <button onClick={next} className="absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black-60/50 text-white hover:bg-black/60">
            <span className="[&>svg]:h-[18px] [&>svg]:w-[15px]"><ChevronRightIcon /></span>
          </button>
          <div className="absolute bottom-3 flex w-full items-center justify-center">
            <span className="rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {imgIndex + 1}
              {' '}
              /
              {displayImages.length}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {displayImages.map((src, i) => (
            <button
              key={src}
              onClick={() => setImgIndex(i)}
              className={`relative h-21.5 w-19 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors ${imgIndex === i ? 'border-primary-100' : 'border-transparent'}`}
            >
              <Image src={src} alt="" fill sizes="76px" className="object-cover" />
            </button>
          ))}
        </div>

        <div className="mt-6 px-4">
          <span className="font-semibold text-white">{props.name}</span>
          {age !== null && <span className="ml-2 text-white-75">{age}</span>}
        </div>

        <div className="mt-6 flex gap-2 px-4">
          <button
            onClick={() => {
              if (activeChat?.characterId) {
                router.push(`/character/${activeChat.characterId}`);
              }
            }}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-primary-100 px-1 py-2.5 text-xs font-semibold text-primary-100 sm:px-3"
          >
            <MediaIcon />
            {t('view_media')}
          </button>
          <button className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-black-20 px-1 py-2.5 text-xs font-semibold text-white sm:px-3">
            <PhoneIcon />
            {t('call_me')}
          </button>
        </div>

        <div className="mt-6 flex flex-col">
          {/* Model row */}
          <button className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm text-white hover:bg-black-40">
            <span className="flex items-center gap-2">
              <ModelIcon />
              {t('model')}
            </span>
            <span className="h-6 w-6 overflow-hidden [&>svg]:h-6 [&>svg]:w-3"><ChevronRightIcon /></span>
          </button>

          {/* Voice row */}
          <button className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm text-white hover:bg-black-40">
            <span className="flex items-center gap-2">
              <VoiceIcon />
              {t('voice')}
            </span>
            <span className="h-6 w-6 overflow-hidden [&>svg]:h-6 [&>svg]:w-3"><ChevronRightIcon /></span>
          </button>

          {/* Memory accordion */}
          <button
            onClick={() => setMemoryOpenId(memoryOpen ? null : (activeChat?.chatroomId ?? null))}
            className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm text-white hover:bg-black-40"
          >
            <span className="flex items-center gap-2">
              <MemoryIcon />
              {t('memory')}
            </span>
            <span className={`transition-transform duration-200 ${memoryOpen ? 'rotate-0' : '-rotate-90'}`}>
              <ChevronDownIcon />
            </span>
          </button>
          {memoryOpen && activeChat && (
            <ChatMemoryPanel chatroomId={activeChat.chatroomId} />
          )}

          {/* Settings accordion */}
          <button
            onClick={() => setSettingsOpenId(settingsOpen ? null : (activeChat?.chatroomId ?? null))}
            className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm text-white hover:bg-black-40"
          >
            <span className="flex items-center gap-2">
              <SettingsIcon />
              {t('settings')}
            </span>
            <span className={`transition-transform duration-200 ${settingsOpen ? 'rotate-0' : '-rotate-90'}`}>
              <ChevronDownIcon />
            </span>
          </button>
          {settingsOpen && activeChat && (
            <ChatSettingsPanel chatroomId={activeChat.chatroomId} />
          )}
        </div>
      </div>
    </div>
  );
};
