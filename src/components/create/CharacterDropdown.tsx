'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';

export const CharacterDropdown = (props: { title: string; children: React.ReactNode; defaultOpen?: boolean; hasSelection?: boolean }) => {
  const [open, setOpen] = useState(props.defaultOpen ?? false);

  return (
    <div className="overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between py-3 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex items-center gap-2 font-medium text-white">
          {props.title}
          {props.hasSelection && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </span>
        <span className={`text-white transition-transform duration-200 [&>svg]:h-4 [&>svg]:w-4 ${open ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div className="px-1 pb-3">
          {props.children}
        </div>
      )}
    </div>
  );
};
