'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { AiIcon, CloseIcon, SpinnerIcon } from '@/components/icons';
import { useGenerateService } from '@/services/generateService';
import { VoiceModal } from './VoiceModal';

const scenes = ['Happy', 'Natural', 'Sad', 'Angry', 'Fearful', 'Disgusted', 'Surprised'] as const;
export type Scene = typeof scenes[number];

export const AudioModal = (props: {
  script: string;
  sceneEmotion: Scene;
  voiceType: string;
  onSave: (values: { script: string; sceneEmotion: Scene; voiceType: string }) => void;
  onClose: () => void;
}) => {
  const { enrichPrompt } = useGenerateService();
  const [script, setScript] = useState(props.script);
  const [sceneEmotion, setSceneEmotion] = useState<Scene>(props.sceneEmotion);
  const [voiceType, setVoiceType] = useState(props.voiceType);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);

  const handleEnrich = async () => {
    const prompt = script.trim();
    if (!prompt || isEnriching) {
      return;
    }
    setIsEnriching(true);
    try {
      const res = await enrichPrompt({ prompt });
      if (res.content?.enriched_prompt) {
        setScript(res.content.enriched_prompt);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not enrich script.');
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-black/80 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="my-auto w-full max-w-160 rounded-2xl border border-white-25 bg-black-80 px-4 py-6 md:px-7.5">
          <div className="mb-5 flex items-center justify-between border-b border-black-40 pb-4">
            <h2 className="text-base font-semibold text-white">Audio</h2>
            <button onClick={props.onClose} className="cursor-pointer text-white-75 hover:text-white">
              <CloseIcon />
            </button>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <textarea
                value={script}
                onChange={e => setScript(e.target.value)}
                disabled={isEnriching}
                placeholder="Type what you want them to say..."
                rows={5}
                className="w-full resize-none rounded-xl border border-black-40 bg-black-100 px-4 py-3 text-sm text-white placeholder:text-white-50 focus:border-primary-100 focus:outline-none disabled:opacity-60"
              />
              <button
                onClick={() => void handleEnrich()}
                disabled={!script.trim() || isEnriching}
                className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-black-40 bg-black-100 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-primary-100 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4"
              >
                {isEnriching ? <SpinnerIcon /> : <AiIcon />}
                Enrich with AI
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-white">Scene</span>
              <div className="flex flex-wrap gap-2">
                {scenes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSceneEmotion(s)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${sceneEmotion === s ? 'bg-primary-100 text-white' : 'bg-black-40 text-white-75 hover:bg-black-60'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-white">Voice Present</span>
              <button
                onClick={() => setVoiceOpen(true)}
                className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-black-40 bg-black-100 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-primary-100"
              >
                <div className="h-2 w-2 rounded-full bg-primary-100" />
                {voiceType}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                props.onSave({ script, sceneEmotion, voiceType });
                props.onClose();
              }}
              className="w-full cursor-pointer rounded-xl bg-primary-100 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {voiceOpen && (
        <VoiceModal
          selected={voiceType}
          onSelect={(v) => {
            setVoiceType(v.localName);
            setVoiceOpen(false);
          }}
          onClose={() => setVoiceOpen(false)}
        />
      )}
    </>
  );
};
