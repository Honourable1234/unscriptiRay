'use client';

import { useState } from 'react';
import { ExpandIcon } from '@/components/icons';

const DEFAULT_MAX_LENGTH = 15000;

export const ExpandableTextarea = (props: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength?: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const maxLength = props.maxLength ?? DEFAULT_MAX_LENGTH;

  return (
    <div className="flex flex-col rounded-2xl border border-black-40 bg-black-60/40 focus-within:border-primary-100">
      <div className="flex items-start gap-2 px-4 pt-3">
        <textarea
          value={props.value}
          onChange={e => props.onChange(e.target.value.slice(0, maxLength))}
          placeholder={props.placeholder}
          rows={expanded ? 10 : 3}
          className="w-full resize-none bg-transparent text-sm text-white placeholder-white-50 focus:outline-none"
        />
        <button
          onClick={() => setExpanded(e => !e)}
          className="shrink-0 cursor-pointer text-white-50 hover:text-white"
        >
          <ExpandIcon />
        </button>
      </div>
      <span className="px-4 pb-2 text-right text-xs text-white-50">
        {props.value.length}
        {' / '}
        {maxLength}
      </span>
    </div>
  );
};
