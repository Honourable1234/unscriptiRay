'use client';

import { useEffect, useRef, useState } from 'react';
import { AddToProfileIcon, AiIcon, DownloadIcon, EditIcon, MoreIcon, RemixIcon, ReportIcon, ShareIcon, SpeechIcon, TrashIcon, VideoIcon } from '@/components/icons';

export type SceneActionKey = 'Remix' | 'Video' | 'Edit' | 'Speech' | 'Enhance' | 'More';

export type SceneMoreActionKey = 'Download' | 'Share' | 'Add to Profile' | 'Report' | 'Delete';

type SceneAssetType = 'image' | 'video';

// `only` limits an action to the asset type it can run on; the rest apply to both.
const actions: { label: SceneActionKey; icon: React.ReactNode; only?: SceneAssetType }[] = [
  { label: 'Remix', icon: <RemixIcon /> },
  { label: 'Video', icon: <VideoIcon />, only: 'image' },
  { label: 'Edit', icon: <EditIcon /> },
  { label: 'Speech', icon: <SpeechIcon />, only: 'video' },
  { label: 'Enhance', icon: <AiIcon />, only: 'image' },
  { label: 'More', icon: <MoreIcon /> },
];

const moreItems: { label: SceneMoreActionKey; icon: React.ReactNode; danger?: boolean }[] = [
  { label: 'Download', icon: <DownloadIcon /> },
  { label: 'Share', icon: <ShareIcon /> },
  { label: 'Add to Profile', icon: <AddToProfileIcon /> },
  { label: 'Report', icon: <ReportIcon />, danger: true },
  { label: 'Delete', icon: <TrashIcon />, danger: true },
];

export const GenerateSceneActions = (props: {
  assetType: SceneAssetType;
  onAction: (key: SceneActionKey) => void;
  onMoreAction?: (key: SceneMoreActionKey) => void;
}) => {
  const [showMore, setShowMore] = useState(false);
  const [popupPos, setPopupPos] = useState({ bottom: 0, left: 0 });
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scoped to the wrapper, not the button: closing on a mousedown inside the
    // popup would unmount the item before its click could run.
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    if (showMore) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [showMore]);

  const openMore = () => {
    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      setPopupPos({ bottom: window.innerHeight - rect.top + 8, left: rect.right - 192 });
    }
    setShowMore(v => !v);
  };

  return (
    <div className="flex items-center gap-2">
      {actions.filter(action => !action.only || action.only === props.assetType).map(action =>
        action.label === 'More'
          ? (
              <div key="More" ref={moreRef}>
                <button
                  ref={moreButtonRef}
                  onClick={openMore}
                  className="flex w-30 cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-black-40 px-3 py-2 text-sm text-white transition-colors hover:bg-black-60"
                >
                  <MoreIcon />
                  More
                </button>
                {showMore && (
                  <div
                    style={{ bottom: popupPos.bottom, left: popupPos.left }}
                    className="fixed z-[70] min-w-48 rounded-xl border border-white/10 bg-black-60 py-1 shadow-xl"
                  >
                    {moreItems.map(item => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setShowMore(false);
                          props.onMoreAction?.(item.label);
                        }}
                        className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${item.danger ? 'text-error-200' : 'text-white'}`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          : (
              <button
                key={action.label}
                onClick={() => props.onAction(action.label)}
                className="flex w-30 cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-black-40 px-3 py-2 text-sm text-white transition-colors hover:bg-black-60"
              >
                {action.icon}
                {action.label}
              </button>
            ),
      )}
    </div>
  );
};
