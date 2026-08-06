'use client';

import type { SceneActionKey } from './GenerateSceneActions';
import type { Asset } from '@/services/generateService';
import { useTranslations } from 'next-intl';
import { CloseIcon } from '@/components/icons';
import { EditContent } from './EditContent';
import { EnhanceContent } from './EnhanceContent';
import { RemixContent } from './RemixContent';
import { SpeechContent } from './SpeechContent';
import { VideoContent } from './VideoContent';

export const GenerateSceneModal = (props: {
  action: SceneActionKey;
  onClose: () => void;
  asset: Asset | null;
  /** Image a video asset was animated from, when it is already loaded. */
  sourceAsset?: Asset | null;
  imageName?: string;
  onSuccess?: () => void;
}) => {
  const t = useTranslations('GenerateSceneModal');

  const titleMap: Record<SceneActionKey, string> = {
    Remix: t('title_remix'),
    Video: t('title_video'),
    Edit: t('title_edit'),
    Speech: t('title_speech'),
    Enhance: t('title_enhance'),
    More: t('title_more'),
  };

  const contentMap: Record<SceneActionKey, React.ReactNode> = {
    Remix: <RemixContent asset={props.asset} sourceAsset={props.sourceAsset} onSuccess={props.onSuccess} />,
    Video: <VideoContent asset={props.asset} onSuccess={props.onSuccess} />,
    Edit: <EditContent asset={props.asset} onSuccess={props.onSuccess} />,
    Speech: <SpeechContent asset={props.asset} onSuccess={props.onSuccess} />,
    Enhance: (
      <EnhanceContent
        imageSrc={props.asset?.url ?? ''}
        imageName={props.imageName}
        assetId={props.asset?.id ?? ''}
        onSuccess={props.onSuccess}
      />
    ),
    More: <div />,
  };

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center overflow-y-auto bg-black/80 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="my-auto w-full max-w-160 rounded-2xl border border-white-25 bg-black-80 px-4 py-6 md:px-7.5">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-black-40 pb-4">
          <h2 className="text-base font-semibold text-white md:text-lg">{titleMap[props.action]}</h2>
          <button onClick={props.onClose} className="cursor-pointer text-white-75 hover:text-white">
            <CloseIcon />
          </button>
        </div>

        {/* Content — each action owns its own generate button */}
        {contentMap[props.action]}
      </div>
    </div>
  );
};
