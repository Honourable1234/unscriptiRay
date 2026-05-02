'use client';

import { useState } from 'react';
import { CloseIcon } from '@/components/icons';

export const ScriptModal = (props: {
  script: string;
  onSave: (script: string) => void;
  onClose: () => void;
}) => {
  const [script, setScript] = useState(props.script);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/80 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="my-auto w-full max-w-160 rounded-2xl border border-white-25 bg-black-80 px-4 py-6 md:px-7.5">
        <div className="mb-5 flex items-center justify-between border-b border-black-40 pb-4">
          <h2 className="text-base font-semibold text-white">Audio Script</h2>
          <button onClick={props.onClose} className="cursor-pointer text-white-75 hover:text-white">
            <CloseIcon />
          </button>
        </div>

        <textarea
          value={script}
          onChange={e => setScript(e.target.value)}
          placeholder="Type what you want them to say..."
          rows={6}
          className="w-full resize-none rounded-xl border border-black-40 bg-black-100 px-4 py-3 text-sm text-white placeholder:text-white-50 focus:border-primary-100 focus:outline-none"
        />

        <div className="mt-6">
          <button
            onClick={() => {
              props.onSave(script);
              props.onClose();
            }}
            className="w-full cursor-pointer rounded-xl bg-primary-100 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
