'use client';

import { useState } from 'react';
import { CloseIcon } from '@/components/icons';

const MAX_TAGS = 10;

export const CreateTagsField = (props: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || props.tags.includes(trimmed) || props.tags.length >= MAX_TAGS) {
      return;
    }
    props.onChange([...props.tags, trimmed]);
    setInput('');
  };

  const removeTag = (tag: string) => {
    props.onChange(props.tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
    }
  };

  return (
    <div className="w-full max-w-209 rounded-xl border border-white-25 bg-black-60">
      <div
        role="button"
        tabIndex={0}
        className="flex cursor-pointer items-center justify-between px-3 py-4"
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setOpen(o => !o);
          }
        }}
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm text-white">
            Tags (
            {props.tags.length}
            /
            {MAX_TAGS}
            )
          </span>
          {!open && (
            <span className={`text-xs ${props.tags.length ? 'text-white-75' : 'text-white-50'}`}>
              {props.tags.length ? props.tags.join(', ') : 'No tags set'}
            </span>
          )}
        </div>
        {open && (
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
        )}
      </div>

      {open && (
        <div className="px-3 pb-4">
          <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-white-25/30 px-3 py-2">
            {props.tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1.5 rounded-md bg-primary-100/20 px-2 py-1 text-xs text-primary-100"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="cursor-pointer hover:text-white"
                >
                  <CloseIcon />
                </button>
              </span>
            ))}
            {props.tags.length < MAX_TAGS && (
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tag..."
                className="min-w-24 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white-25"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
