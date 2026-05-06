'use client';

import type { MyCharacter } from '@/services/useMyAiService';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FilterDropdown } from '@/components/explore/FilterDropdown';
import { SearchIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useMyAiService } from '@/services/useMyAiService';
import { MyAiCard } from './MyAiCard';

type Filter = 'All' | 'Approved' | 'Pending';

const PAGE_SIZE = 9;

export const MyAiSection = () => {
  const { token } = useAuth();
  const { getMyCharacters } = useMyAiService();
  const [characters, setCharacters] = useState<MyCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => {
    if (!token) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect
    setIsLoading(true);
    getMyCharacters({ page: 1, limit: PAGE_SIZE })
      .then((res) => {
        if (res.success) {
          setCharacters(res.content.characters);
          setPage(res.content.pagination.page);
          setPageCount(res.content.pagination.pageCount);
          setTotal(res.content.pagination.total);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    getMyCharacters({ page: nextPage, limit: PAGE_SIZE })
      .then((res) => {
        if (res.success) {
          setCharacters(prev => [...prev, ...res.content.characters]);
          setPage(res.content.pagination.page);
          setPageCount(res.content.pagination.pageCount);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingMore(false));
  };

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
        || c.style.toLowerCase().includes(search.toLowerCase())
        || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesFilter = filter === 'All'
        || (filter === 'Approved' && c.is_approved)
        || (filter === 'Pending' && !c.is_approved);
      return matchesSearch && matchesFilter;
    });
  }, [characters, search, filter]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="text-sm text-white/50">Loading...</span>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <p className="text-sm text-white/50">You haven't created any AI characters yet.</p>
        <Link
          href="/create"
          className="rounded-xl bg-primary-100 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          Create your first AI
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-black-40 bg-black-60 px-3 py-2.5">
        <span className="text-white-50"><SearchIcon /></span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, style or tag..."
          className="flex-1 bg-transparent text-sm text-white placeholder-white-50 focus:outline-none"
        />
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterDropdown
            label="Status"
            value={filter}
            options={['All', 'Approved', 'Pending']}
            onChange={v => setFilter(v as Filter)}
          />
        </div>
        <span className="text-xs text-white/40">
          {total}
          {' '}
          {total === 1 ? 'character' : 'characters'}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0
        ? (
            <div className="flex justify-center py-16">
              <p className="text-sm text-white/50">No characters match your search.</p>
            </div>
          )
        : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((character, i) => (
                  <MyAiCard key={character.id} character={character} priority={i < 3} />
                ))}
              </div>

              {page < pageCount && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="cursor-pointer rounded-xl border border-white/10 bg-black-60 px-8 py-3 text-sm font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
    </div>
  );
};
