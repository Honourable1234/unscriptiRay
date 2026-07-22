'use client';

import { UpgradeIcon } from '../icons';

/**
 * Cleans an enriched prompt for preview: prefers the enriched section when the
 * API returns an "Original/Enriched" pair, and strips markdown bold and quotes.
 * @param text - Raw value stored for the card, may contain markdown.
 * @returns A single-line, human-readable preview string.
 */
const previewText = (text: string) => {
  const enriched = text.split(/enriched prompt:/i).at(-1) ?? text;
  return enriched
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'“”]+|[\s"'“”]+$/g, '')
    .trim();
};

export const GenerateOptionCardWide = (props: {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  isSelected?: boolean;
  selectedName?: string;
  onClick?: () => void;
  width?: string;
  height?: string;
}) => {
  const upgradeBadge = (
    <span className="relative inline-flex">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="upgrade-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-premium-100)" />
            <stop offset="100%" stopColor="var(--color-primary-200)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="[&_path]:fill-[url(#upgrade-grad)]">
        <UpgradeIcon />
      </span>
    </span>
  );

  if (props.isSelected && props.selectedName) {
    return (
      <button
        onClick={props.onClick}
        style={{ width: props.width, height: props.height }}
        className="flex min-h-41 w-full cursor-pointer flex-col items-start gap-2 rounded-xl border border-primary-100 bg-black-100 p-4 text-left transition-colors hover:border-primary-200"
      >
        <span className="flex w-full items-center gap-2 text-sm font-medium text-white">
          <span className="text-primary-100">{props.icon}</span>
          {props.label}
          {upgradeBadge}
          <span className="ml-auto text-xs font-normal text-primary-100">Edit</span>
        </span>
        <p className="line-clamp-4 text-xs leading-relaxed text-white-75">
          {previewText(props.selectedName)}
        </p>
      </button>
    );
  }

  return (
    <button
      onClick={props.onClick}
      style={{ width: props.width, height: props.height }}
      className="flex h-41 w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-white-25 bg-black-100 py-8 text-center transition-colors hover:border-primary-100"
    >
      <span className="text-white-75">{props.icon}</span>
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-2 text-sm font-medium text-white">
          {props.label}
          {upgradeBadge}
        </p>
        <span className="text-xs text-primary-100">{props.sublabel}</span>
      </div>
    </button>
  );
};
