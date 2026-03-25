'use client';
import { useState } from 'react';
import { FilterIcon, SearchIcon } from '@/components/icons';

export const SearchBar = (props: {
  onSearch?: (value: string) => void;
}) => {
  const [value, setValue] = useState('');

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-white-25 bg-black-60 px-4 py-3 sm:gap-3 md:px-6 md:py-4">
        <span className="shrink-0 text-sm text-white-75">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={value}
          placeholder="Search"
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && props.onSearch?.(value)}
          className="w-full bg-transparent text-sm text-white placeholder-white-75 focus:outline-none"
        />
      </div>

      <button
        type="button"
        className="flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white-25 bg-black-60 px-4 py-3 text-white-75 transition-colors hover:text-white md:px-6 md:py-4"
      >
        <FilterIcon />
      </button>
    </div>
  );
};
