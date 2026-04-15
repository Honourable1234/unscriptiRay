import type { Character } from '@/data/characters';
import Image from 'next/image';
import { CloseIcon } from '../icons';

const MAX = 10;

export const SelectedCharacterBar = (props: {
  selected: Character[];
  onRemove: (id: string | number) => void;
  onCreate: () => void;
  createLabel?: string;
}) => (
  <div className="sticky bottom-0 mt-1.5 bg-black-80 p-2.5">
    <div className="flex items-center justify-between gap-4">
      <div className="flex shrink-0 flex-col gap-2">
        <span className="text-base font-semibold text-white">
          Selected character list (
          {props.selected.length}
          /
          {MAX}
          )
        </span>

        {props.selected.length === 0
          ? (
              <span className="text-xs text-white-75">You haven't selected any characters yet</span>
            )
          : (
              <div className="flex flex-wrap gap-2">
                {props.selected.map(c => (
                  <div key={c.id} className="flex items-center gap-1.5 rounded-full border border-white-25 px-3 py-2">
                    <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full">
                      <Image src={c.image} alt={c.name} fill sizes="24px" className="object-cover" />
                    </div>
                    <span className="text-xs whitespace-nowrap text-white">{c.name}</span>
                    <button
                      onClick={() => props.onRemove(c.id)}
                      className="ml-0.5 cursor-pointer text-xs leading-none text-white-75 hover:text-white"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
      </div>

      <button
        onClick={props.onCreate}
        disabled={props.selected.length === 0}
        className="max-w-131 flex-1 cursor-pointer rounded-xl bg-primary-100 px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {props.createLabel ?? 'Create Group'}
      </button>
    </div>
  </div>
);
