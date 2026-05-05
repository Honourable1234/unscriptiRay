import { api } from '@/libs/api';

type ExploreCharactersParams = {
  q?: string;
  identity?: string;
  style?: string;
  age_min?: string;
  age_max?: string;
  vibe?: string;
  sort?: string;
  tags?: string[];
  page?: number;
  limit?: number;
};

export const useExploreService = () => {
  const getFilters = () => api.get('/explore/filters');

  const getCharacters = (params?: ExploreCharactersParams) => {
    const query = new URLSearchParams();
    const set = (key: string, val?: string) => {
      if (val && val !== 'All') {
        query.set(key, val);
      }
    };
    set('q', params?.q);
    set('identity', params?.identity);
    set('style', params?.style);
    set('vibe', params?.vibe);
    set('sort', params?.sort);
    const activeTags = (params?.tags ?? []).filter(t => t !== 'All');
    if (activeTags.length > 0) {
      query.set('tags', activeTags.join(','));
    }
    if (params?.age_min) {
      query.set('age_min', params.age_min);
    }
    if (params?.age_max) {
      query.set('age_max', params.age_max);
    }
    if (params?.page && params.page > 1) {
      query.set('page', String(params.page));
    }
    if (params?.limit) {
      query.set('limit', String(params.limit));
    }
    const qs = query.toString();
    return api.get(`/explore/characters${qs ? `?${qs}` : ''}`);
  };

  return { getFilters, getCharacters };
};
