'use client';

import type { MyCharacter } from '@/services/useMyAiService';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FilterDropdown } from '@/components/explore/FilterDropdown';
import { SearchIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useMyAiService } from '@/services/useMyAiService';
import { MyAiCard } from './MyAiCard';
import { MyAiCardSkeleton } from './MyAiCardSkeleton';

type Filter = 'All' | 'Approved' | 'Pending';

const skeletonKeys = ['a', 'b', 'c'];

export const MyAiSection = () => {
  const { token } = useAuth();
  const { getMyCharacters } = useMyAiService();
  const [characters, setCharacters] = useState<MyCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => {
    if (!token) {
      return;
    }
    getMyCharacters({ limit: 50 })
      .then((res) => {
        if (res.success) {
          setCharacters(res.content.characters);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [token]);

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

  if (!isLoading && characters.length === 0) {
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
      <div className="flex flex-wrap gap-2">
        <FilterDropdown
          label="Status"
          value={filter}
          options={['All', 'Approved', 'Pending']}
          onChange={v => setFilter(v as Filter)}
        />
      </div>

      {/* Grid */}
      {isLoading
        ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {skeletonKeys.map(key => <MyAiCardSkeleton key={key} />)}
            </div>
          )
        : filtered.length === 0
          ? (
              <div className="flex justify-center py-16">
                <p className="text-sm text-white/50">No characters match your search.</p>
              </div>
            )
          : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((character, i) => (
                  <MyAiCard key={character.id} character={character} priority={i < 3} />
                ))}
              </div>
            )}
    </div>
  );
};
