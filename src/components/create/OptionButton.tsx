'use client';

import { PlayIcon, PremiumUpgradeIcon } from '@/components/icons';

export const OptionButton = (props: {
  name: string;
  locked?: boolean;
  selected?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="flex min-w-40 flex-1 cursor-pointer items-center justify-between rounded-lg border border-black-40 bg-black-100 px-6 py-4 transition-colors "
    >
      <div className="flex items-center gap-2 text-sm font-medium text-white">
        {props.name}
        {props.locked && <PremiumUpgradeIcon />}
      </div>
      <div>
        <PlayIcon />
      </div>
    </button>
  );
};
