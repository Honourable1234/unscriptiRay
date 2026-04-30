'use client';

import Image from 'next/image';
import { CloseIcon } from '@/components/icons';

export const GenerateOptionCard = (props: {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  onDeselect?: () => void;
  selectedImage?: string;
  selectedName?: string;
  width?: string;
  height?: string;
}) => {
  if (props.isSelected && props.selectedImage) {
    return (
      <div
        style={{ width: props.width, height: props.height }}
        className="relative m-auto h-56 w-full overflow-hidden rounded-xl border border-primary-100"
      >
        <Image src={props.selectedImage} alt={props.selectedName ?? ''} fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <button
          onClick={props.onDeselect ?? props.onClick}
          className="absolute top-2 right-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          <CloseIcon />
        </button>
        {props.selectedName && (
          <span className="absolute right-0 bottom-2 left-0 px-2 text-center text-xs font-semibold text-white drop-shadow">
            {props.selectedName}
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={props.onClick}
      style={{ width: props.width, height: props.height }}
      className="m-auto flex h-56 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-white-25 bg-black-100 transition-colors hover:border-primary-100"
    >
      <span className="text-white-75">{props.icon}</span>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-white">{props.label}</span>
        <span className="text-xs text-white-75">{props.sublabel}</span>
      </div>
    </button>
  );
};
