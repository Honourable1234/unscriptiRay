'use client';

import { useState } from 'react';
import { CloseIcon, SearchIcon } from '@/components/icons';

type Motion = { id: string; name: string; emoji: string };

const MOTIONS: Motion[] = [
  { id: '1', name: 'Walking', emoji: '🚶' },
  { id: '2', name: 'Running', emoji: '🏃' },
  { id: '3', name: 'Dancing', emoji: '💃' },
  { id: '4', name: 'Fighting', emoji: '🥊' },
  { id: '5', name: 'Sitting', emoji: '🪑' },
  { id: '6', name: 'Standing', emoji: '🧍' },
  { id: '7', name: 'Posing', emoji: '🤳' },
  { id: '8', name: 'Flying', emoji: '🦅' },
  { id: '9', name: 'Swimming', emoji: '🏊' },
  { id: '10', name: 'Hugging', emoji: '🤗' },
  { id: '11', name: 'Waving', emoji: '👋' },
  { id: '12', name: 'Jumping', emoji: '🦘' },
  { id: '13', name: 'Crying', emoji: '😢' },
  { id: '14', name: 'Laughing', emoji: '😄' },
  { id: '15', name: 'Punching', emoji: '👊' },
  { id: '16', name: 'Kicking', emoji: '🦵' },
];

export const SelectMotionModal = (props: {
  onSelect: (motion: { id: string; name: string }) => void;
  onClose: () => void;
}) => {
  const [search, setSearch] = useState('');

  const filtered = MOTIONS.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onClick={props.onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          props.onClose();
        }
      }}
    >
      <div
        role="presentation"
        className="relative my-8 w-full max-w-150 rounded-2xl border border-white-25 bg-black-80 shadow-2xl"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black-40 px-5 py-4">
          <span className="text-base font-semibold text-white">Select Motion</span>
          <button
            onClick={props.onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black-40 hover:bg-black-100"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 rounded-xl border border-black-40 bg-black-60 px-3 py-2.5">
            <span className="text-white-50"><SearchIcon /></span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search motion..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white-50 focus:outline-none"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="max-h-[60vh] overflow-y-auto px-5 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filtered.length === 0
            ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-sm text-white-50">No results</p>
                </div>
              )
            : (
                <div className="flex flex-wrap gap-2">
                  {filtered.map(motion => (
                    <button
                      key={motion.id}
                      onClick={() => props.onSelect({ id: motion.id, name: motion.name })}
                      className="flex h-65 w-40 min-w-40 flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-white-25 bg-black-100 transition-colors hover:border-primary-100"
                    >
                      <span className="text-4xl">{motion.emoji}</span>
                      <span className="text-sm font-semibold text-white">{motion.name}</span>
                    </button>
                  ))}
                </div>
              )}
        </div>
      </div>
    </div>
  );
};
