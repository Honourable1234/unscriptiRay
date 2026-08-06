'use client';

import type { MyCharacter } from '@/services/useMyAiService';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { FilterDropdown } from '@/components/explore/FilterDropdown';
import { SearchIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { guestToken } from '@/libs/guestToken';
import { Link } from '@/libs/I18nNavigation';
import { returnUrl } from '@/libs/returnUrl';
import { useMyAiService } from '@/services/useMyAiService';
import { MyAiCard } from './MyAiCard';
import { MyAiCardSkeleton } from './MyAiCardSkeleton';

type Filter = 'All' | 'Approved' | 'Pending';

const skeletonKeys = ['a', 'b', 'c'];

export const MyAiSection = () => {
  const t = useTranslations('MyAiSection');
  const { isAuthenticated, token } = useAuth();
  const { getMyCharacters } = useMyAiService();
  const [characters, setCharacters] = useState<MyCharacter[]>([]);
  // Skeletons only make sense when a request is actually going out; a visitor
  // without any session has nothing to load.
  const [isLoading, setIsLoading] = useState(() => !!(token ?? guestToken.get()));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => {
    if (!token && !guestToken.get()) {
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
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm font-semibold text-white">{t('signup_title')}</p>
          <p className="max-w-80 text-xs text-white-75">{t('signup_description')}</p>
          <div className="mt-1 flex items-center gap-2">
            <Link
              href="/sign-up"
              onClick={() => returnUrl.save(window.location.pathname)}
              className="rounded-xl bg-primary-100 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              {t('sign_up_free')}
            </Link>
            <Link
              href="/create"
              className="rounded-xl border border-white-25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-primary-100 hover:text-primary-100"
            >
              {t('start_creating')}
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <p className="text-sm text-white/50">{t('empty')}</p>
        <Link
          href="/create"
          className="rounded-xl bg-primary-100 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          {t('create_first')}
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
          placeholder={t('search_placeholder')}
          className="flex-1 bg-transparent text-sm text-white placeholder-white-50 focus:outline-none"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        <FilterDropdown
          label={t('filter_status')}
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
                <p className="text-sm text-white/50">{t('no_matches')}</p>
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
