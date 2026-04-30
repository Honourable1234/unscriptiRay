'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';
import { CreateModal } from './CreateModal';
import { OptionButton } from './OptionButton';

type RawItem = Record<string, unknown>;
type CachedItem = { key: string; label: string; locked?: boolean };

export const OptionModal = (props: {
  title: string;
  endpoint: string;
  labelKey?: string;
  responseKey?: string;
  topItem?: { label: string; locked?: boolean };
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) => {
  const t = useTranslations('OptionModal');
  const { token } = useAuth();
  const cache = useRef<Record<string, CachedItem[]>>({});
  const cacheKey = `${props.endpoint}:${props.responseKey ?? ''}`;
  const [items, setItems] = useState<CachedItem[]>(cache.current[cacheKey] ?? []);
  const [loading, setLoading] = useState(!cache.current[cacheKey]);
  const labelKey = props.labelKey ?? 'name';

  useEffect(() => {
    if (cache.current[cacheKey]) {
      return;
    }
    api.get(props.endpoint, token ?? undefined).then((res: unknown) => {
      const content = (res as { content?: unknown })?.content ?? res;
      const raw = props.responseKey ? (content as Record<string, unknown>)?.[props.responseKey] : content;
      if (Array.isArray(raw)) {
        const top = props.topItem
          ? [{ key: props.topItem.label, label: props.topItem.label, locked: props.topItem.locked }]
          : [];
        const fetched: CachedItem[] = [...top, ...(raw as (RawItem | string)[]).map((item, i) => {
          const locked = i >= 10;
          if (typeof item === 'string') {
            return { key: item, label: item, locked };
          }
          return {
            key: String(item.id ?? item.name ?? item[labelKey]),
            label: String(item[labelKey] ?? item.name ?? ''),
            locked,
          };
        })];
        cache.current[cacheKey] = fetched;
        setItems(fetched);
      }
      setLoading(false);
    });
  }, [cacheKey, token, labelKey]);

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
                selected={props.selected === item.label}
                onClick={() => {
                  props.onSelect(item.label);
                  props.onClose();
                }}
              />
            ))}
      </div>
    </CreateModal>
  );
};
