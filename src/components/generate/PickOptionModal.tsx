'use client';

import { CloseIcon } from '@/components/icons';

export type PickOption = { value: string; label: string };

export const PickOptionModal = (props: {
  title: string;
  options: PickOption[];
  selected: string | null;
  onSelect: (option: PickOption) => void;
  onClose: () => void;
}) => {
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
        className="relative my-auto w-full max-w-120 rounded-2xl border border-white-25 bg-black-80 px-4 py-6 md:px-7.5"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between border-b border-black-40 pb-4">
          <h2 className="text-base font-semibold text-white">{props.title}</h2>
          <button onClick={props.onClose} className="cursor-pointer text-white-75 hover:text-white">
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {props.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                props.onSelect(opt);
                props.onClose();
              }}
              className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${props.selected === opt.value ? 'border-primary-100 bg-primary-100/10 text-primary-100' : 'border-black-40 bg-black-100 text-white hover:border-primary-100'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
