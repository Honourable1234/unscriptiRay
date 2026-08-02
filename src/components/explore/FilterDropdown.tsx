'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const FilterOption = (props: {
  option: string;
  isActive: boolean;
  onSelect: () => void;
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={props.onSelect}
        className={`flex w-full px-4 py-2 text-left text-xs transition-colors hover:bg-white/5 ${props.isActive ? 'font-semibold text-white' : 'text-white/70'}`}
      >
        <span ref={textRef} className="line-clamp-4">{props.option}</span>
      </TooltipTrigger>
      <TooltipContent hidden={!isTruncated}>{props.option}</TooltipContent>
    </Tooltip>
  );
};

export const FilterDropdown = (props: {
  label: string;
  value: string;
  options: string[];
  onChange?: (value: string) => void;
  menuClassName?: string;
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
        <div className={`absolute top-full left-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-black-80 py-1 shadow-lg ${props.menuClassName ?? 'min-w-full'}`}>
          {props.options.map(option => (
            <FilterOption
              key={option}
              option={option}
              isActive={props.value === option}
              onSelect={() => {
                props.onChange?.(option);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
