'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/general/SearchBar';
import { api } from '@/libs/api';
import { ExploreCharacters } from './ExploreCharacters';
import { FilterDropdown } from './FilterDropdown';
import { TagFilter } from './TagFilter';

type AgeRange = { label?: string; name?: string; value?: string; min?: number; max?: number };

type Filters = {
  identities: string[];
  styles: string[];
  age_ranges: AgeRange[];
  vibes: string[];
  sort_options: string[];
  popular_tags: { label?: string; name?: string; tag?: string; value?: string; id?: string }[];
};

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

const toLabel = (item: Record<string, unknown>): string =>
  (item.label ?? item.name ?? item.tag ?? item.value ?? '') as string;

export const ExploreSection = () => {
  const t = useTranslations('ExploreSection');
  const [filters, setFilters] = useState<Filters | null>(null);
  const [rawQuery, setRawQuery] = useState('');
  const [active, setActive] = useState<ActiveFilters>({
    q: '',
    identity: 'All',
    style: 'All',
    age_min: '',
    age_max: '',
    vibe: 'All',
    sort: 'All',
    tags: ['All'],
  });

  useEffect(() => {
    const id = setTimeout(() => setActive(prev => ({ ...prev, q: rawQuery })), 300);
    return () => clearTimeout(id);
  }, [rawQuery]);
  const [selectedAgeLabel, setSelectedAgeLabel] = useState('All');

  useEffect(() => {
    api.get('/explore/filters').then((res) => {
      const c = res?.content;
      if (c) {
        setFilters(c as Filters);
      }
    });
  }, []);

  const handleAgeChange = (label: string) => {
    setSelectedAgeLabel(label);
    if (label === 'All') {
      setActive(prev => ({ ...prev, age_min: '', age_max: '' }));
      return;
    }
    const match = filters?.age_ranges.find(r => toLabel(r as Record<string, unknown>) === label);
    setActive(prev => ({
      ...prev,
      age_min: match?.min !== undefined ? String(match.min) : '',
      age_max: match?.max !== undefined ? String(match.max) : '',
    }));
  };

  const ageRangeOptions = ['All', ...(filters?.age_ranges.map(r => toLabel(r as Record<string, unknown>)) ?? [])];
  const tagOptions = ['All', ...(filters?.popular_tags.map(t => toLabel(t as Record<string, unknown>)) ?? [])];

  return (
    <>
      <SearchBar
        onChange={setRawQuery}
        onSearch={setRawQuery}
      />
      {filters && (
        <>
          <div className="mt-3 hidden flex-wrap items-start gap-2 md:flex">
            <FilterDropdown
              label={t('filter_identity')}
              value={active.identity}
              options={['All', ...filters.identities]}
              onChange={v => setActive(prev => ({ ...prev, identity: v }))}
            />
            <FilterDropdown
              label={t('filter_style')}
              value={active.style}
              options={['All', ...filters.styles]}
              onChange={v => setActive(prev => ({ ...prev, style: v }))}
            />
            <FilterDropdown
              label={t('filter_age')}
              value={selectedAgeLabel}
              options={ageRangeOptions}
              onChange={handleAgeChange}
            />
            <FilterDropdown
              label={t('filter_vibe')}
              value={active.vibe}
              options={['All', ...filters.vibes]}
              onChange={v => setActive(prev => ({ ...prev, vibe: v }))}
            />
            <FilterDropdown
              label={t('filter_sort')}
              value={active.sort}
              options={['All', ...filters.sort_options]}
              onChange={v => setActive(prev => ({ ...prev, sort: v }))}
            />
          </div>
          <div className="mt-3 mb-4">
            <TagFilter
              tags={tagOptions}
              selected={active.tags}
              onChange={v => setActive(prev => ({ ...prev, tags: v }))}
            />
          </div>
        </>
      )}
      <ExploreCharacters filters={active} />
    </>
  );
};
