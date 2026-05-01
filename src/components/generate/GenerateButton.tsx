'use client';

import { useTranslations } from 'next-intl';
import { StackedCoinIcon } from '@/components/icons';

export const GenerateButton = (props: {
  onClick: () => void;
  coins?: number;
  label?: string;
  isLoading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  py?: string;
  px?: string;
  textSize?: string;
}) => {
  const t = useTranslations('GenerateButton');

  return (
    <button
      onClick={props.onClick}
      disabled={props.isLoading}
      style={props.style}
      className={`m-auto flex w-full max-w-118 cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-primary-100 disabled:cursor-not-allowed ${props.px ?? 'px-6'} ${props.py ?? 'py-4'} ${props.textSize ?? 'text-sm'} font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${props.className ?? ''}`}
    >
      <span>{props.label ?? t('generate_image')}</span>
      <span className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm font-semibold">
        {props.coins ?? 10}
        <StackedCoinIcon />
      </span>
    </button>
  );
};
