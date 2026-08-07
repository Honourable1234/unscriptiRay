'use client';

import { useTranslations } from 'next-intl';
import { PlayIcon } from '@/components/icons';

export const CharacterInfoCard = (props: {
  title: string;
  value?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) => {
  const t = useTranslations('CharacterInfoCard');

  return (
    <div
      role="button"
      tabIndex={0}
      className={`m-auto flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-4 ${props.value ? 'border-primary-100' : 'border-white-25'}`}
      onClick={props.onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          props.onClick?.();
        }
      }}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white [&>svg]:h-5 [&>svg]:w-5">
        {props.icon ?? <PlayIcon />}
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-white">{props.title}</span>
        <span className={`text-sm font-medium ${props.value ? 'text-white' : 'text-white-25'}`}>
          {props.value || t('select', { title: props.title })}
        </span>
      </div>
    </div>
  );
};
