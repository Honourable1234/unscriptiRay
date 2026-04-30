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
    <div ref={containerRef} className="w-fit self-start rounded-xl bg-black-60 p-3">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex w-full items-center gap-1.5 text-xs whitespace-nowrap"
      >
        <span className="text-white-50">
          {props.label}
          :
        </span>
        <span className={props.value ? 'text-white' : 'text-white-50'}>
          {props.value || 'Select'}
        </span>
        <span className={`${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen && (
        <div className="">
          {props.options.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => {
                props.onChange?.(option);
                setIsOpen(false);
              }}
              className="flex w-full flex-col py-2 text-left text-xs text-white"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
