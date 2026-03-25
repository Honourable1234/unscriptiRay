'use client';
import { useState } from 'react';

const TAGS = ['All', 'Group Chats', 'MILF', 'Teen', 'Asian', 'Latina', 'Blonde', 'Busty', 'Submissive', 'Dominant', 'BDSM', 'Romantic', 'Athletic'];

export const TagFilter = () => {
  const [selected, setSelected] = useState('All');

  return (
    <div className="flex items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {TAGS.map(tag => (
        <button
          key={tag}
          type="button"
          onClick={() => setSelected(tag)}
          className={`rounded-xl px-6 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
            selected === tag
              ? 'bg-primary-100 text-white'
              : 'text-white-75 hover:text-white'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};
