'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
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
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { useChatNavigation } from '@/context/ChatContext';
import { useCharacterService } from '@/services/useCharacterService';
import { useChatService } from '@/services/useChatService';
import { isValidImageSrc } from '@/utils/isValidImageSrc';
import { ChatInstructionsPanel } from './ChatInstructionsPanel';
import { ChatMemoryPanel } from './ChatMemoryPanel';
import { ChatSettingsPanel } from './ChatSettingsPanel';
import { ChatVoicePanel } from './ChatVoicePanel';

export const ChatRightPanelToggle = () => {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="cursor-pointer text-white-50 hover:text-white"
    >
      <OpenIcon />
    </button>
  );
};

export const ChatRightPanel = (props: {
  name: string;
  image: string;
  onBackgroundDisplayChange?: (v: boolean) => void;
}) => {
  const t = useTranslations('ChatRightPanel');
  // const { toggleSidebar } = useSidebar();
  const { activeChat } = useChatNavigation();
  const { getCharacter, getCharacterMedia } = useCharacterService();
  const { initiateCall } = useChatService();
  const router = useRouter();
  const [imgIndex, setImgIndex] = useState(0);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [calling, setCalling] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [age, setAge] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'instructions' | 'voice' | 'memory' | 'settings' | null>(null);

  const sectionTitle = activeSection === 'instructions'
    ? 'Instructions'
    : activeSection === 'voice'
      ? t('voice')
      : activeSection === 'memory'
        ? t('memory')
        : activeSection === 'settings'
          ? t('settings')
          : '';

  useEffect(() => {
    if (!activeChat?.characterId) {
      return;
    }

    getCharacter(activeChat.characterId).then((res) => {
      const c = res?.content;
      if (c?.age) {
        setAge(c.age as number);
      }
    }).catch(() => {});

    getCharacterMedia(activeChat.characterId, 'images').then((res) => {
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
  }, [activeChat?.characterId]);

  const displayImages = (images.length > 0 ? images : [props.image])
    .map(src => isValidImageSrc(src) ? src : '/General/Profile.png');
  const prev = () => setImgIndex(i => (i - 1 + displayImages.length) % displayImages.length);
  const next = () => setImgIndex(i => (i + 1) % displayImages.length);

  useEffect(() => {
    thumbRefs.current[imgIndex]?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }, [imgIndex]);

  return (
    <Sidebar side="right" collapsible="offcanvas" className="h-full border-black-40 bg-black-100">
      <SidebarContent className="relative">
        {/* {!activeSection && (
          <button
            onClick={toggleSidebar}
            className="absolute top-3 left-3 z-20 flex w-fit cursor-pointer items-center justify-center rounded-full bg-black-60/50 p-2 text-white hover:bg-black/60"
          >
            <OpenIcon />
          </button>
        )} */}

        <div className="relative h-full">
          {/* List pane */}
          <div
            className={`absolute inset-0 overflow-y-auto overscroll-contain pb-6 transition-transform duration-300 ease-in-out [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              activeSection ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            <div className="flex flex-col">
              <div className="relative aspect-[14/15] w-full flex-shrink-0 overflow-hidden">
                <div
                  className="flex h-full transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${imgIndex * 100}%)` }}
                >
                  {displayImages.map((src, i) => (
                    <div key={src} className="relative h-full w-full flex-shrink-0">
                      <Image src={src} alt={props.name} fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" priority={i === 0} />
                    </div>
                  ))}
                </div>
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
                    ref={(el) => {
                      thumbRefs.current[i] = el;
                    }}
                    onClick={() => setImgIndex(i)}
                    className={`h-21.5 w-19 flex-shrink-0 cursor-pointer rounded-xl border-2 p-1 transition-colors ${imgIndex === i ? 'border-primary-100' : 'border-transparent'}`}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-lg">
                      <Image src={src} alt="" fill sizes="76px" className="object-cover" />
                    </div>
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
                <button
                  disabled={calling || !activeChat}
                  onClick={() => {
                    if (!activeChat) {
                      return;
                    }
                    setCalling(true);
                    initiateCall(activeChat.chatroomId)
                      .then(() => {
                        toast.success('Call started!');
                      })
                      .catch(() => toast.error('Failed to start call.'))
                      .finally(() => setCalling(false));
                  }}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-black-20 px-1 py-2.5 text-xs font-semibold text-white disabled:opacity-50 sm:px-3"
                >
                  <PhoneIcon />
                  {calling ? '…' : t('call_me')}
                </button>
              </div>

              <div className="mt-6 flex flex-col">
                <button
                  onClick={() => setActiveSection('instructions')}
                  className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm text-white hover:bg-black-40"
                >
                  <span className="flex items-center gap-2">
                    <ModelIcon />
                    Instructions
                  </span>
                  <span className="h-6 w-6 overflow-hidden [&>svg]:h-6 [&>svg]:w-3"><ChevronRightIcon /></span>
                </button>

                <button
                  onClick={() => setActiveSection('voice')}
                  className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm text-white hover:bg-black-40"
                >
                  <span className="flex items-center gap-2">
                    <VoiceIcon />
                    {t('voice')}
                  </span>
                  <span className="h-6 w-6 overflow-hidden [&>svg]:h-6 [&>svg]:w-3"><ChevronRightIcon /></span>
                </button>

                <button
                  onClick={() => setActiveSection('memory')}
                  className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm text-white hover:bg-black-40"
                >
                  <span className="flex items-center gap-2">
                    <MemoryIcon />
                    {t('memory')}
                  </span>
                  <span className="h-6 w-6 overflow-hidden [&>svg]:h-6 [&>svg]:w-3"><ChevronRightIcon /></span>
                </button>

                <button
                  onClick={() => setActiveSection('settings')}
                  className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm text-white hover:bg-black-40"
                >
                  <span className="flex items-center gap-2">
                    <SettingsIcon />
                    {t('settings')}
                  </span>
                  <span className="h-6 w-6 overflow-hidden [&>svg]:h-6 [&>svg]:w-3"><ChevronRightIcon /></span>
                </button>
              </div>
            </div>
          </div>

          {/* Detail pane */}
          <div
            className={`absolute inset-0 overflow-y-auto overscroll-contain pb-6 transition-transform duration-300 ease-in-out [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              activeSection ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {activeSection && activeChat && (
              <>
                <div className="border-b border-black-40 px-4 py-3.5">
                  <button onClick={() => setActiveSection(null)} className="flex cursor-pointer items-center gap-1  text-white">
                    <span className="[&>svg]:h-4 [&>svg]:w-3.5">
                      <ChevronLeftIcon />
                    </span>
                    <p className="text-sm font-medium tracking-wide text-white capitalize">{sectionTitle}</p>
                  </button>
                </div>
                {activeSection === 'instructions' && (
                  <ChatInstructionsPanel chatroomId={activeChat.chatroomId} />
                )}
                {activeSection === 'voice' && <ChatVoicePanel />}
                {activeSection === 'memory' && (
                  <ChatMemoryPanel chatroomId={activeChat.chatroomId} />
                )}
                {activeSection === 'settings' && (
                  <ChatSettingsPanel
                    chatroomId={activeChat.chatroomId}
                    onBackgroundDisplayChange={props.onBackgroundDisplayChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
