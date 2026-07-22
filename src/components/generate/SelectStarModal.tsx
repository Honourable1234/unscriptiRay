'use client';

import type { Character } from '@/data/characters';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { CardSkeleton } from '@/components/general/CardSkeleton';
import { CloseIcon, SearchIcon } from '@/components/icons';
import { createExploreService } from '@/services/useExploreService';
import { mapCharacter } from '@/utils/mapCharacter';
import { SelectCard } from './SelectCard';

const skeletonKeys = ['a', 'b', 'c', 'd', 'e', 'f'];

type StarCharacter = { id: string; name: string; image: string };

type SelectStarModalProps
  = | { multiple?: false; onSelect: (character: StarCharacter) => void; onClose: () => void }
    | { multiple: true; selected: StarCharacter[]; max: number; onConfirm: (characters: StarCharacter[]) => void; onClose: () => void };

export const SelectStarModal = (props: SelectStarModalProps) => {
  const t = useTranslations('SelectStarModal');
  const { getCharacters } = createExploreService();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<StarCharacter[]>(props.multiple ? props.selected : []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect
    setLoading(true);
    const timer = setTimeout(() => {
      getCharacters({ limit: 20, q: search || undefined }).then((res) => {
        const list: unknown = res?.content?.characters;
        if (Array.isArray(list)) {
          setCharacters(list.map(c => mapCharacter(c as Record<string, unknown>)));
        } else {
          setCharacters([]);
        }
      }).catch(() => {
        setCharacters([]);
      }).finally(() => {
        setLoading(false);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (character: Character) => {
    const star: StarCharacter = { id: String(character.id), name: character.name, image: character.image };
    if (!props.multiple) {
      props.onSelect(star);
      props.onClose();
      return;
    }
    const max = props.max;
    setPicked((prev) => {
      if (prev.some(s => s.id === star.id)) {
        return prev.filter(s => s.id !== star.id);
      }
      return prev.length >= max ? prev : [...prev, star];
    });
  };

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
          <span className="text-base font-semibold text-white">{t('title')}</span>
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
              placeholder={t('search_placeholder')}
              className="flex-1 bg-transparent text-sm text-white placeholder-white-50 focus:outline-none"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="max-h-[60vh] overflow-y-auto px-5 pt-1 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading
            ? (
                <div className="flex flex-wrap gap-2">
                  {skeletonKeys.map(key => <CardSkeleton key={key} size="sm" />)}
                </div>
              )
            : characters.length === 0
              ? (
                  <div className="flex items-center justify-center py-16">
                    <p className="text-sm text-white-50">{t('no_results')}</p>
                  </div>
                )
              : (
                  <div className="flex flex-wrap gap-2">
                    {characters.map((character, i) => {
                      const isPicked = picked.some(s => s.id === String(character.id));
                      return (
                        <SelectCard
                          key={String(character.id)}
                          character={character}
                          onClick={() => handleSelect(character)}
                          priority={i < 4}
                          isSelected={isPicked}
                          isDisabled={props.multiple && !isPicked && picked.length >= props.max}
                        />
                      );
                    })}
                  </div>
                )}
        </div>

        {props.multiple && (
          <div className="flex items-center justify-between gap-3 border-t border-black-40 px-5 py-4">
            <span className="text-sm text-white-50">{t('selected_count', { count: picked.length, max: props.max })}</span>
            <button
              onClick={() => {
                props.onConfirm(picked);
                props.onClose();
              }}
              disabled={picked.length === 0}
              className="cursor-pointer rounded-xl bg-primary-100 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('done')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
