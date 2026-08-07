'use client';

import type { SceneActionKey, SceneMoreActionKey } from '@/components/generate/GenerateSceneActions';
import type { Asset } from '@/services/generateService';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SignUpPromptModal } from '@/components/general/SignUpPromptModal';
import { GenerateSceneActions } from '@/components/generate/GenerateSceneActions';
import { GenerateSceneModal } from '@/components/generate/GenerateSceneModal';
import { CloseIcon, VideoIcon } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { downloadFile } from '@/libs/downloadFile';
import { assetAspectRatio, useGenerateService } from '@/services/generateService';

type ThumbnailItem = { id: string; url: string; type: string };

const pageSize = 30;

// Footprint of one thumbnail card including its gap: w-31 + gap-2 across, h-39 + gap-2 down.
const cardWidth = 132;
const cardHeight = 164;

/**
 * Picks the file extension to save an asset under.
 * @param asset - Asset being downloaded.
 * @returns The extension from the asset URL, or one implied by its type.
 */
const assetExtension = (asset: Asset) => {
  const fromUrl = asset.url.split('?')[0]?.match(/\.([a-z0-9]{3,4})$/i)?.[1];
  return fromUrl ?? (asset.type === 'video' ? 'mp4' : 'png');
};

export default function GenerateScenePage() {
  const t = useTranslations('GenerateScenePage');
  const tPrompt = useTranslations('SignUpPrompts');
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const { getGeneratedAssets, deleteAsset } = useGenerateService();
  const [activeId, setActiveId] = useState(params.id);
  const [modal, setModal] = useState<SceneActionKey | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(!!token);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);

  /**
   * Loads a page of generated assets, replacing the rail on page 1 and appending after it.
   * @param nextPage - One-based page to fetch.
   * @returns A promise that settles once the page is applied.
   */
  const fetchAssets = (nextPage: number) =>
    getGeneratedAssets({ limit: pageSize, page: nextPage, sort: 'newest' }).then((res) => {
      if (!res.success) {
        return;
      }
      const batch = [...res.content.images, ...res.content.videos];
      setAssets(prev => (nextPage === 1 ? batch : [...prev, ...batch]));
      setPage(nextPage);
      setPageCount(res.content.pagination.pageCount);
    });

  useEffect(() => {
    if (!token) {
      return;
    }
    fetchAssets(1)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleRailScroll = (rail: HTMLDivElement) => {
    if (isLoadingMore || page >= pageCount) {
      return;
    }
    // The rail is a horizontal row on mobile and a vertical column on sm+.
    const isRow = rail.scrollWidth > rail.clientWidth;
    const remaining = isRow
      ? rail.scrollWidth - rail.clientWidth - rail.scrollLeft
      : rail.scrollHeight - rail.clientHeight - rail.scrollTop;
    if (remaining > (isRow ? cardWidth : cardHeight) * 2) {
      return;
    }
    setIsLoadingMore(true);
    fetchAssets(page + 1)
      .catch(() => {})
      .finally(() => setIsLoadingMore(false));
  };

  const activeAsset = assets.find(a => a.id === activeId) ?? null;
  const displaySrc = activeAsset?.url ?? '';
  const isVideo = activeAsset?.type === 'video';
  const aspectRatio = activeAsset ? assetAspectRatio(activeAsset) : undefined;
  // A video keeps only the id of the image it was animated from, so the loaded
  // rail is where the scene actions read that image's own settings.
  const sourceAsset = assets.find(a => a.id === activeAsset?.settings.sourceImageId) ?? null;

  const thumbnails: ThumbnailItem[] = assets.map(a => ({ id: a.id, url: a.url, type: a.type }));

  const handleDownload = async (asset: Asset) => {
    // Sonner replaces a toast by reusing its id rather than a separate update call.
    const toastId = toast.loading(t('download_started'));
    try {
      await downloadFile(asset.url, `unscripti-${asset.id}.${assetExtension(asset)}`);
      toast.success(t('download_saved'), { id: toastId, duration: 2000 });
    } catch {
      // Buckets that refuse cross-origin reads leave opening the file as the
      // only way for the user to save it by hand.
      toast.error(t('download_failed'), { id: toastId, duration: 4000 });
      window.open(asset.url, '_blank', 'noopener');
    }
  };

  const handleShare = async (asset: Asset) => {
    // Share the scene page, not the asset URL: bucket URLs are not public and
    // the page always resolves the newest URL for the asset.
    const target = new URL(window.location.href);
    target.pathname = target.pathname.replace(/[^/]+$/, asset.id);
    const url = target.toString();

    if (navigator.share) {
      // Dismissing the share sheet rejects with AbortError, which is not a failure.
      await navigator.share({ url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('link_copied'));
    } catch {
      toast.error(t('copy_failed'));
    }
  };

  const handleDelete = async (asset: Asset) => {
    try {
      await deleteAsset(asset.id);
      toast.success(t('scene_deleted'));
      const remaining = assets.filter(a => a.id !== asset.id);
      setAssets(remaining);
      if (remaining.length > 0) {
        setActiveId(remaining[0]!.id);
      } else {
        router.back();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('delete_failed'));
    }
  };

  const handleMoreAction = async (key: SceneMoreActionKey) => {
    if (!activeAsset) {
      return;
    }
    if (key === 'Download') {
      await handleDownload(activeAsset);
      return;
    }
    if (key === 'Share') {
      // Called before any await so the share sheet keeps the click's activation.
      await handleShare(activeAsset);
      return;
    }
    if (key === 'Delete') {
      if (!token) {
        setShowSignUpPrompt(true);
        return;
      }
      await handleDelete(activeAsset);
      return;
    }
    // Report and Add to Profile have no endpoint on the API yet.
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
      <div className="flex min-h-0 flex-1 items-center justify-center px-2 py-5">
        {isLoading
          ? <Skeleton className="h-full max-h-123 w-full max-w-105 rounded-lg" />
          : !activeAsset
              ? <p className="text-sm text-white-50">{t('scene_not_found')}</p>
              : isVideo
                ? (
                    <video
                      src={displaySrc}
                      controls
                      playsInline
                      style={{ aspectRatio }}
                      className="max-h-full w-full max-w-105 rounded-lg object-contain"
                    >
                      <track kind="captions" />
                    </video>
                  )
                : (
                    <div
                      style={{ aspectRatio }}
                      className="relative max-h-full w-full max-w-105 overflow-hidden rounded-lg"
                    >
                      <Image
                        src={displaySrc}
                        alt={t('scene_alt')}
                        fill
                        className="object-contain"
                        sizes="512px"
                      />
                    </div>
                  )}
      </div>

      {/* Actions */}
      <div className="overflow-x-auto pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="m-auto flex w-fit gap-2 px-4">
          <GenerateSceneActions
            assetType={isVideo ? 'video' : 'image'}
            onAction={key => setModal(key)}
            onMoreAction={key => void handleMoreAction(key)}
          />
        </div>
      </div>

      {/* Thumbnails — scrollable row on mobile, column top-right on sm+ */}
      <div
        onScroll={e => handleRailScroll(e.currentTarget)}
        className="absolute top-4 right-0 left-0 overflow-x-auto [scrollbar-width:none] sm:right-4 sm:left-auto sm:max-h-[calc(100dvh-2rem)] sm:overflow-x-hidden sm:overflow-y-auto [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex gap-2 px-4 sm:flex-col sm:px-0">
          {thumbnails.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`relative h-39 w-31 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors ${activeId === item.id ? 'border-primary-100' : 'border-transparent'}`}
            >
              {item.type === 'video'
                ? (
                    <>
                      {/* Assets carry no poster, so the first frame stands in as the thumbnail. */}
                      <video
                        src={`${item.url}#t=0.1`}
                        preload="metadata"
                        muted
                        playsInline
                        className="h-full w-full bg-black-60 object-cover"
                      >
                        <track kind="captions" />
                      </video>
                      <span className="absolute right-1.5 bottom-1.5 rounded-full bg-black-60 p-1 text-white">
                        <VideoIcon />
                      </span>
                    </>
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
          asset={activeAsset}
          sourceAsset={sourceAsset}
          imageName={activeAsset ? t('generated_label', { type: activeAsset.type }) : ''}
          onSuccess={() => {
            fetchAssets(1).catch(() => {});
          }}
        />
      )}

      {showSignUpPrompt && (
        <SignUpPromptModal
          description={tPrompt('manage_scenes')}
          onClose={() => setShowSignUpPrompt(false)}
        />
      )}
    </div>
  );
}
