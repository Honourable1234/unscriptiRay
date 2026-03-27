'use client';

import type { Character } from '@/data/characters';
import Image from 'next/image';
import { useState } from 'react';
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
  const [imageIndex, setImageIndex] = useState(0);
  const [navClicks, setNavClicks] = useState(0);

  const images = [props.character.image, '/General/GojoSatoru2.png', '/General/GojoSatoru3.png', '/General/GojoSatoru4.png'];
  const tags = props.character.tags;
  const visibleTags = tags.slice(0, MAX_TAGS_VISIBLE);
  const extraCount = tags.length - MAX_TAGS_VISIBLE;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="button"
      tabIndex={0}
      onClick={props.onClose}
      onKeyDown={props.onClose}
    >
      <div
        className="relative w-full max-w-130 rounded-2xl border border-white-25 bg-black-80 pt-5 shadow-2xl"
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
        <p className="mb-3 px-4 text-xs leading-relaxed text-white-75">
          {expanded
            ? props.character.description
            : `${props.character.description.slice(0, 120)}...`}
          {props.character.description.length > 120 && (
            <button
              className="ml-1 text-sm font-semibold text-white hover:underline"
              onClick={() => setExpanded(v => !v)}
            >
              {expanded ? 'show less' : 'show more'}
            </button>
          )}
        </p>

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

        {/* Image carousel */}
        <div className="relative mx-4 mb-8 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
          {/* Previous — peeks in from left */}
          <div className="absolute top-1/2 left-0 z-10 h-70 w-60 -translate-y-1/2 overflow-hidden rounded-3xl opacity-50">
            <Image
              src={images[(imageIndex - 1 + images.length) % images.length] ?? props.character.image}
              alt={props.character.name}
              fill
              className="object-cover blur-[4px]"
            />
          </div>

          {/* Current — centered, slightly smaller */}
          <div className="relative z-20 mx-auto h-full w-85 overflow-hidden rounded-3xl">
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
            <div className="absolute left-1/2 z-40 flex h-full w-85 -translate-x-1/2 flex-col items-center justify-center gap-[2px] rounded-lg">
              <p className="text-[20px] font-bold text-white">Want to see more?</p>
              <button className="cursor-pointer rounded-xl bg-primary-100 px-8 py-2 text-xs font-semibold text-white">
                View Content
              </button>
            </div>
          )}

          {/* Next — peeks in from right */}
          <div className="absolute top-1/2 right-0 z-10 h-70 w-50 -translate-y-1/2 overflow-hidden rounded-3xl opacity-50">
            <Image
              src={images[(imageIndex + 1) % images.length] ?? props.character.image}
              alt={props.character.name}
              fill
              className="object-cover blur-[4px]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-black-40 p-4">
          <button className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-black-20 py-3 text-sm font-semibold text-white">
            <CaptureIcon />
            Generate
          </button>
          <button className="flex flex-2 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-100 py-3 text-sm font-semibold text-white">
            <ChatIcon2 />
            Chat
          </button>
        </div>
      </div>
    </div>
  );
};
