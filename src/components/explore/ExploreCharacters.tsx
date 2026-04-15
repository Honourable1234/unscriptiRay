'use client';

import type { Character } from '@/data/characters';
import { useEffect, useState } from 'react';
import { api } from '@/libs/api';
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

const mapCharacter = (c: Record<string, unknown>): Character => ({
  id: c.id as string,
  name: c.name as string,
  age: c.age as number,
  gender: c.gender as 'Male' | 'Female',
  description: c.short_bio as string,
  image: c.image_url as string,
  likes: String(c.like_count),
  comments: String(c.total_chats),
  tags: (c.tags as string[]) ?? [],
});

const buildParams = (filters: ActiveFilters, page: number, limit: number) => {
  const params = new URLSearchParams();
  const set = (key: string, val?: string) => {
    if (val && val !== 'All') {
      params.set(key, val);
    }
  };
  set('q', filters.q);
  set('identity', filters.identity);
  set('style', filters.style);
  set('vibe', filters.vibe);
  set('sort', filters.sort);
  const activeTags = filters.tags.filter(t => t !== 'All');
  if (activeTags.length > 0) {
    params.set('tags', activeTags.join(','));
  }
  if (filters.age_min) {
    params.set('age_min', filters.age_min);
  }
  if (filters.age_max) {
    params.set('age_max', filters.age_max);
  }
  if (page > 1) {
    params.set('page', String(page));
  }
  params.set('limit', String(limit));
  return params.toString();
};

const LIMIT_OPTIONS = [5, 10, 15, 20];

export const ExploreCharacters = (props: { filters?: ActiveFilters }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect
    setLoading(true);
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setPage(1);
    const query = buildParams(props.filters ?? { q: '', identity: 'All', style: 'All', age_min: '', age_max: '', vibe: 'All', sort: 'All', tags: ['All'] }, 1, limit);
    api.get(`/explore/characters${query ? `?${query}` : ''}`).then((res) => {
      const list: unknown = res?.content?.characters;
      const pagination = res?.content?.pagination as { pageCount?: number } | undefined;
      setPageCount(pagination?.pageCount ?? 1);
      if (Array.isArray(list)) {
        setCharacters(list.map(c => mapCharacter(c as Record<string, unknown>)));
      } else {
        setCharacters([]);
      }
    }).catch((_err: unknown) => {
    }).finally(() => {
      setLoading(false);
    });
  }, [props.filters, limit]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    const query = buildParams(props.filters ?? { q: '', identity: 'All', style: 'All', age_min: '', age_max: '', vibe: 'All', sort: 'All', tags: ['All'] }, nextPage, limit);
    api.get(`/explore/characters${query ? `?${query}` : ''}`).then((res) => {
      const list: unknown = res?.content?.characters;
      if (Array.isArray(list)) {
        setCharacters(prev => [...prev, ...list.map(c => mapCharacter(c as Record<string, unknown>))]);
        setPage(nextPage);
      }
    }).finally(() => {
      setLoadingMore(false);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-sm text-white-50">Please wait while we fetch media...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs text-white-75">Per page:</span>
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
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </>
  );
};
