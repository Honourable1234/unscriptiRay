'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CloseIcon, SearchIcon } from '@/components/icons';
import { useGenerateService } from '@/services/generateService';

export type Motion = { id: string; name: string; value: string; imageUrl: string | null };

export const SelectMotionModal = (props: {
  onSelect: (motion: Motion) => void;
  onClose: () => void;
}) => {
  const t = useTranslations('SelectMotionModal');
  const { getPresets } = useGenerateService();
  const [search, setSearch] = useState('');
  const [motions, setMotions] = useState<Motion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The presets endpoint has no `motion` type; `action` presets are the motion source.
    getPresets('action').then((res) => {
      const list = Array.isArray(res.content) ? res.content : [];
      setMotions(
        [...list]
          .sort((a, b) => a.display_order - b.display_order)
          .map(preset => ({
            id: preset.id,
            name: preset.display_name || preset.name,
            value: preset.name,
            imageUrl: preset.image_url,
          })),
      );
    }).catch(() => {
      setMotions([]);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const filtered = motions.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-black/80 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black-40 px-5 py-4">
          <span className="text-base font-semibold text-white">{t('title')}</span>
          <button
            onClick={props.onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black-40 hover:bg-black-100"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search */}
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

        {/* Grid */}
        <div className="max-h-[60vh] overflow-y-auto px-5 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading
            ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-sm text-white-50">{t('loading')}</p>
                </div>
              )
            : filtered.length === 0
              ? (
                  <div className="flex items-center justify-center py-16">
                    <p className="text-sm text-white-50">{t('empty')}</p>
                  </div>
                )
              : (
                  <div className="flex flex-wrap gap-2">
                    {filtered.map((motion, i) => (
                      <button
                        key={motion.id}
                        onClick={() => props.onSelect(motion)}
                        className="relative flex h-65 max-w-50 min-w-40 flex-1 cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white-25 bg-black-100 transition-colors hover:border-primary-100"
                      >
                        {motion.imageUrl
                          ? (
                              <>
                                <Image src={motion.imageUrl} alt={motion.name} fill sizes="200px" priority={i < 4} className="object-cover" />
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                                <span className="absolute right-0 bottom-0 left-0 p-2.5 text-center text-sm font-semibold text-white">{motion.name}</span>
                              </>
                            )
                          : <span className="px-2 text-center text-sm font-semibold text-white">{motion.name}</span>}
                      </button>
                    ))}
                  </div>
                )}
        </div>
      </div>
    </div>
  );
};
