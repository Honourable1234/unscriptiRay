'use client';

import { UpgradeIcon } from '../icons';

export const GenerateOptionCardWide = (props: {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  width?: string;
  height?: string;
}) => {
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
          <span className="relative inline-flex">
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="upgrade-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-error-100)" />
                  <stop offset="100%" stopColor="var(--color-primary-200)" />
                </linearGradient>
              </defs>
            </svg>
            <span className="[&_path]:fill-[url(#upgrade-grad)]">
              <UpgradeIcon />
            </span>
          </span>
        </p>
        <span className="text-xs text-primary-100">{props.sublabel}</span>
      </div>
    </button>
  );
};
