'use client';

import type { SceneActionKey, SceneMoreActionKey } from '@/components/generate/GenerateSceneActions';
import type { Asset } from '@/services/generateService';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { GenerateSceneActions } from '@/components/generate/GenerateSceneActions';
import { GenerateSceneModal } from '@/components/generate/GenerateSceneModal';
import { CloseIcon, SpinnerIcon, VideoIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useGenerateService } from '@/services/generateService';

type ThumbnailItem = { id: string; url: string; type: string };

export default function GenerateScenePage() {
  const t = useTranslations('GenerateScenePage');
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const { getGeneratedAssets, deleteAsset } = useGenerateService();
  const [activeId, setActiveId] = useState(params.id);
  const [modal, setModal] = useState<SceneActionKey | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(!!token);

  useEffect(() => {
    if (!token) {
      return;
    }
    getGeneratedAssets({ limit: 30, sort: 'newest' })
      .then((res) => {
        if (res.success) {
          setAssets([...res.content.images, ...res.content.videos]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [token]);

  const activeAsset = assets.find(a => a.id === activeId) ?? null;
  const displaySrc = activeAsset?.url ?? '';
  const isVideo = activeAsset?.type === 'video';

  const thumbnails: ThumbnailItem[] = assets.map(a => ({ id: a.id, url: a.url, type: a.type }));

  const handleMoreAction = async (key: SceneMoreActionKey) => {
    if (!activeAsset) {
      return;
    }
    if (key === 'Download') {
      window.open(activeAsset.url, '_blank', 'noopener');
      return;
    }
    if (key === 'Share') {
      try {
        await navigator.clipboard.writeText(activeAsset.url);
        toast.success(t('link_copied'));
      } catch {
        toast.error(t('copy_failed'));
      }
      return;
    }
    if (key === 'Delete') {
      try {
        await deleteAsset(activeAsset.id);
        toast.success(t('scene_deleted'));
        const remaining = assets.filter(a => a.id !== activeAsset.id);
        setAssets(remaining);
        if (remaining.length > 0) {
          setActiveId(remaining[0]!.id);
        } else {
          router.back();
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t('delete_failed'));
      }
      return;
    }
    toast.info(t('not_available'));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Close */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10 cursor-pointer rounded-full bg-black-60 p-1 text-white"
      >
        <CloseIcon />
      </button>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center px-2">
        {isLoading
          ? (
              <span className="animate-spin text-white-50">
                <SpinnerIcon />
              </span>
            )
          : !activeAsset
              ? <p className="text-sm text-white-50">{t('scene_not_found')}</p>
              : isVideo
                ? (
                    <video
                      src={displaySrc}
                      controls
                      playsInline
                      className="h-full max-h-123 w-full max-w-105 rounded-lg object-cover"
                    >
                      <track kind="captions" />
                    </video>
                  )
                : (
                    <div className="relative h-full max-h-123 w-full max-w-105 overflow-hidden rounded-lg">
                      <Image
                        src={displaySrc}
                        alt={t('scene_alt')}
                        fill
                        className="object-cover"
                        sizes="512px"
                      />
                    </div>
                  )}
      </div>

      {/* Actions */}
      <div className="overflow-x-auto pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="m-auto flex w-fit gap-2 px-4">
          <GenerateSceneActions onAction={key => setModal(key)} onMoreAction={key => void handleMoreAction(key)} />
        </div>
      </div>

      {/* Thumbnails — scrollable row on mobile, column top-right on sm+ */}
      <div className="absolute top-4 right-0 left-0 overflow-x-auto [scrollbar-width:none] sm:right-4 sm:left-auto sm:overflow-x-visible [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 px-4 sm:flex-col sm:px-0">
          {thumbnails.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`relative h-39 w-31 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors ${activeId === item.id ? 'border-primary-100' : 'border-transparent'}`}
            >
              {item.type === 'video'
                ? (
                    <div className="flex h-full w-full items-center justify-center bg-black-60 text-white-50">
                      <VideoIcon />
                    </div>
                  )
                : (
                    <Image src={item.url} alt={t('thumbnail_alt')} fill className="object-cover" sizes="124px" />
                  )}
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <GenerateSceneModal
          action={modal}
          onClose={() => setModal(null)}
          imageSrc={displaySrc}
          imageName={activeAsset ? t('generated_label', { type: activeAsset.type }) : ''}
          assetId={activeAsset?.id ?? ''}
          onSuccess={() => {
            getGeneratedAssets({ limit: 30, sort: 'newest' })
              .then((res) => {
                if (res.success) {
                  setAssets([...res.content.images, ...res.content.videos]);
                }
              })
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
}
