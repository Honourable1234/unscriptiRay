'use client';

import type { SceneActionKey } from './GenerateSceneActions';
import { CloseIcon } from '@/components/icons';
import { EditContent } from './EditContent';
import { EnhanceContent } from './EnhanceContent';
import { GenerateButton } from './GenerateButton';
import { RemixContent } from './RemixContent';
import { SpeechContent } from './SpeechContent';
import { VideoContent } from './VideoContent';

const titleMap: Record<SceneActionKey, string> = {
  Remix: 'Remix',
  Video: 'Image to Video',
  Edit: 'Edit image',
  Speech: 'Lipsync video',
  Enhance: 'Enhance image',
  More: 'More',
};

const buttonLabelMap: Record<SceneActionKey, string> = {
  Remix: 'Generate Image',
  Video: 'Generate Animation',
  Edit: 'Edit Image',
  Speech: 'Generate Audio',
  Enhance: 'Enhance',
  More: 'Generate',
};

const coinsMap: Record<SceneActionKey, number> = {
  Remix: 10,
  Video: 100,
  Edit: 10,
  Speech: 10,
  Enhance: 10,
  More: 10,
};

export const GenerateSceneModal = (props: {
  action: SceneActionKey;
  onClose: () => void;
  imageSrc?: string;
  imageName?: string;
}) => {
  const contentMap: Record<SceneActionKey, React.ReactNode> = {
    Remix: <RemixContent />,
    Video: <VideoContent />,
    Edit: <EditContent />,
    Speech: <SpeechContent />,
    Enhance: <EnhanceContent imageSrc={props.imageSrc ?? ''} imageName={props.imageName} />,
    More: <div />,
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/80 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="my-auto w-full max-w-160 rounded-2xl border border-white-25 bg-black-80 px-4 py-6 md:px-7.5">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-black-40 pb-4">
          <h2 className="text-base font-semibold text-white md:text-lg">{titleMap[props.action]}</h2>
          <button onClick={props.onClose} className="cursor-pointer text-white-75 hover:text-white">
            <CloseIcon />
          </button>
        </div>

        {/* Content — unique per action */}
        {contentMap[props.action]}

        {/* Generate button */}
        <div className="mt-6">
          <GenerateButton label={buttonLabelMap[props.action]} coins={coinsMap[props.action]} py="py-2" px="px-4" textSize="text-xs" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};
