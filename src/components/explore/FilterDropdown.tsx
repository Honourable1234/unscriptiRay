'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';

export const FilterDropdown = (props: {
  label: string;
  value: string;
  options: string[];
  onChange?: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-fit self-start">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-1.5 rounded-xl bg-black-60 px-3 py-2.5 text-xs whitespace-nowrap"
      >
        <span className="text-white-50">
          {props.label}
          {': '}
        </span>
        <span className={props.value ? 'font-semibold text-white' : 'text-white-50'}>
          {props.value || 'All'}
        </span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-full rounded-xl border border-white/10 bg-black-80 py-1 shadow-lg">
          {props.options.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => {
                props.onChange?.(option);
                setIsOpen(false);
              }}
              className={`flex w-full px-4 py-2 text-left text-xs transition-colors hover:bg-white/5 ${props.value === option ? 'font-semibold text-white' : 'text-white/70'}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
