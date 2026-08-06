'use client';

import Image from 'next/image';
import { PremiumUpgradeIcon } from '@/components/icons';
import { isValidImageSrc } from '@/utils/isValidImageSrc';

export const OptionCard = (props: {
  label: string;
  imageUrl?: string | null;
  selected?: boolean;
  locked?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      className="relative h-65 max-w-50 min-w-40 flex-1 cursor-pointer overflow-hidden rounded-2xl bg-black-60"
      role="button"
      tabIndex={0}
      onClick={props.onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          props.onClick?.();
        }
      }}
    >
      {isValidImageSrc(props.imageUrl) && (
        <Image src={props.imageUrl} alt={props.label} fill sizes="200px" className="object-cover" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {props.selected && (
        <>
          <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-primary-100" />
          <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-white">
            ✓
          </span>
        </>
      )}

      {props.locked && (
        <span className="absolute top-2 left-2 text-primary-100">
          <PremiumUpgradeIcon />
        </span>
      )}

      <div className="absolute right-0 bottom-0 left-0 p-2.5 text-center">
        <span className="text-sm font-semibold text-white">{props.label}</span>
      </div>
    </div>
  );
};
