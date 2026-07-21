'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CloseIcon, SpinnerIcon } from '@/components/icons';
import { useGenerateService } from '@/services/generateService';

type SelectedAsset = { id: string; url: string; type: string };

export const SelectAssetModal = (props: {
  title: string;
  filter: 'all' | 'image' | 'video';
  onSelect: (asset: SelectedAsset) => void;
  onClose: () => void;
}) => {
  const { getGeneratedAssets } = useGenerateService();
  const [assets, setAssets] = useState<SelectedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getGeneratedAssets({ filter: props.filter, sort: 'newest', limit: 30 })
      .then((res) => {
        if (res.success) {
          setAssets([...res.content.images, ...res.content.videos]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

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
          {isLoading
            ? (
                <div className="flex items-center justify-center py-16">
                  <span className="animate-spin text-white-50"><SpinnerIcon /></span>
                </div>
              )
            : assets.length === 0
              ? (
                  <div className="flex items-center justify-center py-16">
                    <p className="text-sm text-white-50">Nothing generated yet — generate a scene first</p>
                  </div>
                )
              : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {assets.map((asset, i) => (
                      <button
                        key={asset.id}
                        onClick={() => props.onSelect(asset)}
                        className="relative h-65 cursor-pointer overflow-hidden rounded-2xl border border-white-25 bg-black-100 transition-colors hover:border-primary-100"
                      >
                        {asset.type === 'video'
                          ? (
                              <video src={asset.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                            )
                          : (
                              <Image src={asset.url} alt="Generated asset" fill sizes="200px" priority={i < 3} className="object-cover" />
                            )}
                      </button>
                    ))}
                  </div>
                )}
        </div>
      </div>
    </div>
  );
};
