'use client';

import type { Character } from '@/data/characters';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import {
  CaptureIcon,
  ChatIcon2,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  FemaleIcon,
  HeartIcon2,
  MaleIcon,
  PictureIcon,
  ProfileIcon,
  VideoIcon,
} from '@/components/icons';

const MAX_TAGS_VISIBLE = 3;

export const CharacterModal = (props: {
  character: Character;
  onClose: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [navClicks, setNavClicks] = useState(0);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const descRef = (node: HTMLParagraphElement | null) => {
    if (node) {
      setIsClamped(node.scrollHeight > node.clientHeight);
    }
  };

  const images = [props.character.image, '/General/GojoSatoru2.png', '/General/GojoSatoru3.png', '/General/GojoSatoru4.png'];
  const tags = props.character.tags;
  const visibleTags = tags.slice(0, MAX_TAGS_VISIBLE);
  const extraCount = tags.length - MAX_TAGS_VISIBLE;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="button"
      tabIndex={0}
      onClick={props.onClose}
      onKeyDown={props.onClose}
    >
      <div
        className="relative w-full max-w-120 rounded-2xl border border-white-25 bg-black-80 pt-5 shadow-2xl"
        role="button"
        tabIndex={0}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black-40 hover:bg-black-100"
          onClick={props.onClose}
        >
          <CloseIcon />
        </button>

        {/* Header */}
        <div className="mb-3 flex items-center gap-2 px-4">
          <span className="text-lg font-semibold text-white">{props.character.name}</span>
          <span className="text-base font-medium text-white-75">{props.character.age}</span>
          {props.character.gender === 'Male' ? <MaleIcon /> : <FemaleIcon />}
        </div>

        {/* Description */}
        <div className="mb-3 px-4">
          <p ref={descRef} className={`text-xs leading-relaxed text-white-75 ${!expanded ? 'line-clamp-2' : ''}`}>
            {props.character.description}
          </p>
          {(isClamped || expanded) && (
            <button
              className="mt-1 cursor-pointer text-xs font-semibold text-white hover:underline"
              onClick={() => setExpanded(v => !v)}
            >
              {expanded ? 'show less' : 'show more'}
            </button>
          )}

        </div>

        {/* Stats */}
        <div className="mb-6 flex items-center gap-4 px-4 text-xs text-white-75">
          <div className="flex items-center gap-[3px]">
            <HeartIcon2 />
            <span>{props.character.likes}</span>
          </div>
          <div className="flex items-center gap-[3px]">
            <PictureIcon />
            <span>31</span>
          </div>
          <div className="flex items-center gap-[3px]">
            <VideoIcon />
            <span>11</span>
          </div>
          <div className="flex items-center gap-[3px]">
            <ProfileIcon />
            <span>Profile</span>
          </div>
        </div>

        {/* Tags */}
        <div className="m-auto mb-6 flex w-fit gap-2">
          {visibleTags.map(tag => (
            <span
              key={tag}
              className="rounded-lg bg-black-40 p-3 text-xs font-medium text-white-75"
            >
              {tag}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="rounded-lg p-3 text-xs font-medium text-white-75">
              +
              {extraCount}
              {' '}
              more
            </span>
          )}
        </div>
        <div className="relative mx-4 mb-8 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
          <div className="absolute top-1/2 left-0 z-10 h-[76%] w-[49%] -translate-y-1/2 overflow-hidden rounded-3xl opacity-50">
            <Image
              src={images[(imageIndex - 1 + images.length) % images.length] ?? props.character.image}
              alt={props.character.name}
              fill
              className="object-cover blur-[4px]"
            />
          </div>
          <div className="relative z-20 mx-auto h-full w-[70%] overflow-hidden rounded-3xl">
            <Image
              src={images[imageIndex] ?? props.character.image}
              alt={props.character.name}
              fill
              className={`object-cover transition-all duration-300 ${navClicks >= 3 ? 'blur-[3px]' : ''}`}
            />
            <button
              className="absolute top-1/2 -left-2.5 z-30 -translate-y-1/2 cursor-pointer"
              onClick={() => {
                setImageIndex(i => (i - 1 + images.length) % images.length);
                setNavClicks(n => n + 1);
              }}
            >
              <ChevronLeftIcon />
            </button>
            <button
              className="absolute top-1/2 -right-2.5 z-30 -translate-y-1/2 cursor-pointer"
              onClick={() => {
                setImageIndex(i => (i + 1) % images.length);
                setNavClicks(n => n + 1);
              }}
            >
              <ChevronRightIcon />
            </button>
          </div>

          {navClicks >= 3 && (
            <div className="absolute left-1/2 z-40 flex h-full w-[70%] -translate-x-1/2 flex-col items-center justify-center gap-[2px] rounded-lg">
              <p className="text-sm font-bold text-white sm:text-[20px]">Want to see more?</p>
              <Link href={`/character/${props.character.id}`} className="rounded-xl bg-primary-100 px-2 py-2 text-xs font-semibold text-white sm:px-8">
                View Content
              </Link>
            </div>
          )}
          <div className="absolute top-1/2 right-0 z-10 h-[76%] w-[41%] -translate-y-1/2 overflow-hidden rounded-3xl opacity-50">
            <Image
              src={images[(imageIndex + 1) % images.length] ?? props.character.image}
              alt={props.character.name}
              fill
              className="object-cover blur-[4px]"
            />
          </div>
        </div>
        <div className="flex gap-3 border-t border-black-40 p-4">
          <button
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-black-20 py-3 text-sm font-semibold text-white"
            disabled={generateLoading}
            onClick={() => {
              setGenerateLoading(true);
              setTimeout(() => setGenerateLoading(false), 3000);
            }}
          >
            <CaptureIcon />
            {generateLoading ? <BouncingDots /> : 'Generate'}
          </button>
          <button
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-100 py-3 text-sm font-semibold text-white md:flex-2"
            disabled={chatLoading}
            onClick={() => {
              setChatLoading(true);
              setTimeout(() => setChatLoading(false), 3000);
            }}
          >
            <ChatIcon2 />
            {chatLoading ? <BouncingDots /> : 'Chat'}
          </button>
        </div>
      </div>
    </div>
  );
};
