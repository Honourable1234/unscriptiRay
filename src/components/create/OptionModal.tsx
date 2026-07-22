'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { CloseIcon, SearchIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';
import { CreateModal } from './CreateModal';
import { OptionButton } from './OptionButton';
import { OptionCard } from './OptionCard';

type RawItem = Record<string, unknown>;
type CachedItem = { key: string; value: string; label: string; imageUrl: string | null; locked?: boolean };

export const OptionModal = (props: {
  title: string;
  endpoint: string;
  labelKey?: string;
  responseKey?: string;
  topItem?: { label: string; locked?: boolean };
  selected: string;
  multiSelect?: boolean;
  selectedValues?: string[];
  cardStyle?: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
}) => {
  const t = useTranslations('OptionModal');
  const { token } = useAuth();
  const cache = useRef<Record<string, CachedItem[]>>({});
  const cacheKey = `${props.endpoint}:${props.responseKey ?? ''}`;
  const [items, setItems] = useState<CachedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const labelKey = props.labelKey ?? 'display_name';

  useEffect(() => {
    if (cache.current[cacheKey]) {
      return;
    }
    api.get(props.endpoint, token ?? undefined).then((res: unknown) => {
      const content = (res as { content?: unknown })?.content ?? res;
      const raw = props.responseKey ? (content as Record<string, unknown>)?.[props.responseKey] : content;
      if (Array.isArray(raw)) {
        const top = props.topItem
          ? [{ key: props.topItem.label, value: props.topItem.label, label: props.topItem.label, imageUrl: null, locked: props.topItem.locked }]
          : [];
        const fetched: CachedItem[] = [...top, ...(raw as (RawItem | string)[]).map((item, i) => {
          const locked = i >= 10;
          if (typeof item === 'string') {
            return { key: item, value: item, label: item, imageUrl: null, locked };
          }
          const value = String(item.value ?? item.id ?? item.name ?? item[labelKey]);
          return {
            key: value,
            value,
            label: String(item[labelKey] ?? item.name ?? value),
            imageUrl: (item.image_url as string | null | undefined) ?? null,
            locked,
          };
        })];
        cache.current[cacheKey] = fetched;
        setItems(fetched);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [cacheKey, token, labelKey]);

  const select = (value: string) => {
    props.onSelect(value);
    if (!props.multiSelect) {
      props.onClose();
    }
  };

  const isSelected = (item: CachedItem) => props.multiSelect
    ? (props.selectedValues ?? []).includes(item.value)
    : props.selected === item.value;

  if (props.cardStyle) {
    const filtered = items.filter(item => item.label.toLowerCase().includes(search.toLowerCase()));

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
          <div className="flex items-center justify-between border-b border-black-40 px-5 py-4">
            <span className="text-base font-semibold text-white">{props.title}</span>
            <button
              onClick={props.onClose}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black-40 hover:bg-black-100"
            >
              <CloseIcon />
            </button>
          </div>

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

          <div className="max-h-[60vh] overflow-y-auto px-5 pt-1 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {loading
              ? (
                  <div className="flex items-center justify-center py-16">
                    <p className="text-sm text-white-50">{t('loading')}</p>
                  </div>
                )
              : (
                  <div className="flex flex-wrap gap-2">
                    {filtered.map(item => (
                      <OptionCard
                        key={item.key}
                        label={item.label}
                        imageUrl={item.imageUrl}
                        locked={item.locked}
                        selected={isSelected(item)}
                        onClick={() => select(item.value)}
                      />
                    ))}
                  </div>
                )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <CreateModal title={props.title} onClose={props.onClose}>
      <div className="scrollbar-none flex max-h-136 flex-wrap gap-2 overflow-y-auto">
        {loading
          ? <span className="text-sm text-white-50">{t('loading')}</span>
          : items.map(item => (
              <OptionButton
                key={item.key}
                name={item.label}
                locked={item.locked}
                selected={isSelected(item)}
                onClick={() => select(item.value)}
              />
            ))}
      </div>
    </CreateModal>
  );
};
