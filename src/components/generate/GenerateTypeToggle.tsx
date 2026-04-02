'use client';

import { PictureIcon, SparkleIcon, VideoIcon } from '@/components/icons';

type GenerateType = 'still' | 'animated';

const tabs: { label: string; value: GenerateType; icon: React.ReactNode }[] = [
  { label: 'Still Images', value: 'still', icon: <PictureIcon /> },
  { label: 'Animated Scenes', value: 'animated', icon: <VideoIcon /> },
];

export const GenerateTypeToggle = (props: {
  active: GenerateType;
  onChange: (type: GenerateType) => void;
  onModeClick: () => void;
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 py-2 md:py-4">
      <div className="flex flex-wrap rounded-xl border border-black-40 bg-black-100 px-2 py-1">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => props.onChange(tab.value)}
            className={`m-auto flex cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors sm:px-12 ${props.active === tab.value ? 'border border-primary-100 bg-black-40 bg-primary-100/10 text-primary-100 transition-colors hover:bg-primary-100/20' : 'text-white hover:text-white-75'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <button
        onClick={props.onModeClick}
        className="cursor-pointer items-center rounded-xl border border-success-100 bg-success-100/10 px-6 py-2 text-start text-sm leading-none font-medium text-success-100 transition-colors hover:bg-success-100/20"
      >
        <p className="text-xs text-white">mode</p>
        <p className="flex">
          {' '}
          Style Present
          <SparkleIcon />
        </p>
      </button>
    </div>
  );
};

export type { GenerateType };
