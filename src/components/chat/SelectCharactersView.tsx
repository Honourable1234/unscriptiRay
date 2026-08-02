'use client';

import type { Character } from '@/data/characters';
import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/general/SearchBar';
import { useAuth } from '@/context/AuthContext';
import { useCharacterService } from '@/services/useCharacterService';
import { createExploreService } from '@/services/useExploreService';
import { mapCharacter } from '@/utils/mapCharacter';
import { SelectableCharacterCard } from './SelectableCharacterCard';
import { SelectedCharacterBar } from './SelectedCharacterBar';

const MAX = 10;
const PAGE_SIZE = 20;

export const SelectCharactersView = (props: {
  preSelectedId?: string;
  heading: string;
  extraField: React.ReactNode;
  createLabel?: string;
}) => {
  const { getCharacters } = createExploreService();
  const { authLoading } = useAuth();
  const { getCharacter } = useCharacterService();
  const [query, setQuery] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selected, setSelected] = useState<Character[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    getCharacters({ page: 1, limit: PAGE_SIZE }).then((res) => {
      const list: unknown = res?.content?.characters ?? res?.content ?? res?.data ?? res;
      const pagination = res?.content?.pagination as { pageCount?: number } | undefined;
      setPageCount(pagination?.pageCount ?? 1);
      if (Array.isArray(list)) {
        setCharacters(list.map(c => mapCharacter(c as Record<string, unknown>)));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // The character is only readable as its owner, so wait for the session.
    if (!props.preSelectedId || authLoading) {
      return;
    }
    getCharacter(props.preSelectedId).then((res) => {
      const c = res?.content;
      if (c) {
        setSelected([mapCharacter(c as Record<string, unknown>)]);
      }
    }).catch(() => {});
  }, [props.preSelectedId, authLoading]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    getCharacters({ page: nextPage, limit: PAGE_SIZE }).then((res) => {
      const list: unknown = res?.content?.characters ?? res?.content ?? res?.data ?? res;
      if (Array.isArray(list)) {
        const incoming = list.map(c => mapCharacter(c as Record<string, unknown>));
        setCharacters((prev) => {
          const seen = new Set(prev.map(c => c.id));
          return [...prev, ...incoming.filter(c => !seen.has(c.id))];
        });
        setPage(nextPage);
      }
    }).catch(() => {}).finally(() => {
      setLoadingMore(false);
    });
  };

  const filtered = characters.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  const toggle = (character: Character) => {
    setSelected(prev =>
      prev.find(c => c.id === character.id)
        ? prev.filter(c => c.id !== character.id)
        : prev.length < MAX ? [...prev, character] : prev,
    );
  };

  return (
    <div className="flex flex-col">
      <div className="px-1 pb-4">
        {props.extraField}
      </div>

      <h1 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl md:text-[32px]">
        {props.heading}
      </h1>

      <SearchBar hideFilter onChange={setQuery} />

      <div className="mt-6 flex flex-wrap gap-2">
        {filtered.map(character => (
          <SelectableCharacterCard
            key={String(character.id)}
            character={character}
            selected={!!selected.find(c => c.id === character.id)}
            onClick={() => toggle(character)}
          />
        ))}
      </div>

      {page < pageCount && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="cursor-pointer rounded-xl border border-white-25 px-8 py-3 text-sm font-semibold text-white transition-colors hover:border-primary-100 hover:text-primary-100 disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      <SelectedCharacterBar
        selected={selected}
        onRemove={id => setSelected(prev => prev.filter(c => c.id !== id))}
        onCreate={() => {}}
        createLabel={props.createLabel}
        disabled
      />
    </div>
  );
};
