'use client';

import type { Character } from '@/data/characters';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { createExploreService } from '@/services/useExploreService';
import { mapCharacter } from '@/utils/mapCharacter';
import { CharacterGrid } from './CharacterGrid';

type ActiveFilters = {
  q: string;
  identity: string;
  style: string;
  age_min: string;
  age_max: string;
  vibe: string;
  sort: string;
  tags: string[];
};

const LIMIT_OPTIONS = [5, 10, 15, 20];

export const ExploreCharacters = (props: { filters?: ActiveFilters }) => {
  const t = useTranslations('ExploreCharacters');
  const { getCharacters } = createExploreService();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect
    setLoading(true);
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setPage(1);
    const f = props.filters;
    getCharacters({ ...f, page: 1, limit }).then((res) => {
      const list: unknown = res?.content?.characters;
      const pagination = res?.content?.pagination as { pageCount?: number } | undefined;
      setPageCount(pagination?.pageCount ?? 1);
      if (Array.isArray(list)) {
        setCharacters(list.map(c => mapCharacter(c as Record<string, unknown>)));
      } else {
        setCharacters([]);
      }
    }).catch(() => {
      setError(true);
    }).finally(() => {
      setLoading(false);
    });
  }, [props.filters, limit]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    const f = props.filters;
    getCharacters({ ...f, page: nextPage, limit }).then((res) => {
      const list: unknown = res?.content?.characters;
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-sm text-white-50">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-sm text-white-50">{t('error')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs text-white-75">{t('per_page')}</span>
        {LIMIT_OPTIONS.map(n => (
          <button
            key={n}
            onClick={() => setLimit(n)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${limit === n ? 'bg-primary-100 text-white' : 'border border-white-25 text-white-75 hover:text-white'}`}
          >
            {n}
          </button>
        ))}
      </div>
      <CharacterGrid characters={characters} showLike />
      {page < pageCount && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="cursor-pointer rounded-xl border border-white-25 px-8 py-3 text-sm font-semibold text-white transition-colors hover:border-primary-100 hover:text-primary-100 disabled:opacity-50"
          >
            {loadingMore ? t('loading_more') : t('load_more')}
          </button>
        </div>
      )}
    </>
  );
};
