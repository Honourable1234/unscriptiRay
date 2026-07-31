'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { AiIcon, CloseIcon, SpinnerIcon } from '@/components/icons';
import { useGenerateService } from '@/services/generateService';

export const ScriptModal = (props: {
  script: string;
  onSave: (script: string) => void;
  onClose: () => void;
}) => {
  const { enrichPrompt } = useGenerateService();
  const [script, setScript] = useState(props.script);
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
        className="relative my-auto w-full max-w-120 rounded-2xl border border-white-25 bg-black-80 px-4 py-6 md:px-7.5"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between border-b border-black-40 pb-4">
          <h2 className="text-base font-semibold text-white">Audio Script</h2>
          <button onClick={props.onClose} className="cursor-pointer text-white-75 hover:text-white">
            <CloseIcon />
          </button>
        </div>

        <textarea
          value={script}
          onChange={e => setScript(e.target.value)}
          disabled={isEnriching}
          rows={5}
          placeholder="Type what you want them to say..."
          className="w-full resize-none rounded-xl border border-black-40 bg-black-100 px-4 py-3 text-sm text-white placeholder:text-white-50 focus:border-primary-100 focus:outline-none disabled:opacity-60"
        />

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={() => void handleEnrich()}
            disabled={!script.trim() || isEnriching}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-black-40 bg-black-100 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-primary-100 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4"
          >
            {isEnriching ? <SpinnerIcon /> : <AiIcon />}
            Enrich with AI
          </button>
          <button
            onClick={() => {
              props.onSave(script);
              props.onClose();
            }}
            className="cursor-pointer rounded-xl bg-primary-100 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
