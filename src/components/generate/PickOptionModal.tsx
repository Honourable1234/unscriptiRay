'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CloseIcon } from '@/components/icons';
import { useGenerateService } from '@/services/generateService';

export type PickOption = { value: string; label: string; image?: string };

export type PickOptionType = 'action' | 'setting' | 'mood';

export const PickOptionModal = (props: {
  title: string;
  type: PickOptionType;
  selected: string | null;
  onSelect: (option: PickOption) => void;
  onClose: () => void;
}) => {
  const t = useTranslations('PickOptionModal');
  const { getPresets } = useGenerateService();
  const [options, setOptions] = useState<PickOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPresets(props.type).then((res) => {
      const list = Array.isArray(res.content) ? res.content : [];
      setOptions(
        list
          .sort((a, b) => a.display_order - b.display_order)
          .map(preset => ({
            value: preset.name,
            label: preset.display_name || preset.name,
            image: preset.image_url ?? undefined,
          })),
      );
    }).catch(() => {
      setOptions([]);
    }).finally(() => {
      setLoading(false);
    });
  }, [props.type]);

  const handleSelect = (option: PickOption) => {
    props.onSelect(option);
    props.onClose();
  };

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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black-40 px-5 py-4">
          <span className="text-base font-semibold text-white">{props.title}</span>
          <button
            onClick={props.onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black-40 hover:bg-black-100"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Grid */}
        <div className="max-h-[60vh] overflow-y-auto px-5 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading
            ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-sm text-white-50">{t('loading')}</p>
                </div>
              )
            : options.length === 0
              ? (
                  <div className="flex items-center justify-center py-16">
                    <p className="text-sm text-white-50">{t('no_results')}</p>
                  </div>
                )
              : (
                  <div className="flex flex-wrap gap-2">
                    {options.map((option, i) => (
                      <div
                        key={option.value}
                        role="button"
                        tabIndex={0}
                        className={`relative h-65 max-w-50 min-w-40 flex-1 cursor-pointer overflow-hidden rounded-2xl ${option.value === props.selected ? 'border border-primary-100' : ''}`}
                        onClick={() => handleSelect(option)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleSelect(option);
                          }
                        }}
                      >
                        {option.image && (
                          <Image src={option.image} alt={option.label} fill sizes="200px" priority={i < 4} className="object-cover" />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute right-0 bottom-0 left-0 p-2.5 text-center">
                          <span className="text-sm font-semibold text-white">{option.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
        </div>
      </div>
    </div>
  );
};
