'use client';

import { useState } from 'react';
import { AiIcon, CloseIcon, EditIcon, SpinnerIcon } from '@/components/icons';

export const CreateAccordionField = (props: {
  title: string;
  subtitle?: string;
  placeholder?: string;
  value?: string;
  expandable?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onChange?: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const expandable = props.expandable !== false;

  return (
    <div className="w-full max-w-209 rounded-xl border border-white-25 bg-black-60">
      <div
        role="button"
        tabIndex={0}
        className={`flex items-center justify-between px-3 py-4 ${expandable ? 'cursor-pointer' : ''}`}
        onClick={() => expandable ? setOpen(o => !o) : props.onClick?.()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (expandable) {
              setOpen(o => !o);
            } else {
              props.onClick?.();
            }
          }
        }}
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm text-white">{props.title}</span>
          {props.subtitle && (
            <span className="text-xs text-white-75">{props.subtitle}</span>
          )}
          {expandable && !open && (
            <span className={`text-xs ${props.value?.trim() ? 'text-white-75' : 'text-white-50'}`}>
              {props.value?.trim() || props.placeholder}
            </span>
          )}
        </div>
        {expandable
          ? open
            ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                  className="text-white-50 hover:text-white"
                >
                  <CloseIcon />
                </button>
              )
            : <span className="text-white-75"><EditIcon /></span>
          : <span className="rounded-full bg-primary-100/20 px-2 py-2 text-primary-100">{props.loading ? <SpinnerIcon /> : <AiIcon />}</span>}
      </div>

      {expandable && open && (
        <div className="px-5 pb-5">
          <textarea
            value={props.value ?? ''}
            onChange={e => props.onChange?.(e.target.value)}
            placeholder={props.placeholder}
            rows={4}
            className="w-full resize-none rounded-xl border border-white-25/30 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white-25 focus:border-white-50"
          />
        </div>
      )}
    </div>
  );
};
