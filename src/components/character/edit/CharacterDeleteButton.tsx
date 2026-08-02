'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { CloseIcon, SpinnerIcon, TrashIcon } from '@/components/icons';
import { useRouter } from '@/libs/I18nNavigation';
import { useCharacterService } from '@/services/useCharacterService';

export const CharacterDeleteButton = (props: { id: string; name: string }) => {
  const { deleteCharacter } = useCharacterService();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    setDeleting(true);
    deleteCharacter(props.id).then(() => {
      toast.success(`${props.name} was deleted`);
      router.replace('/my-ai');
    }).catch((error: unknown) => {
      setDeleting(false);
      toast.error(error instanceof Error ? error.message : 'Could not delete this character');
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-error-200/60 px-4 py-2.5 text-xs font-semibold text-error-200 transition-colors hover:bg-error-200/10"
      >
        <TrashIcon />
        Delete
      </button>

      {open && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => !deleting && setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && !deleting) {
              setOpen(false);
            }
          }}
        >
          <div
            role="presentation"
            className="relative w-full max-w-100 rounded-2xl border border-white-25 bg-black-80 px-6 py-6"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-black-40 pb-4">
              <h2 className="text-base font-semibold text-white">
                Delete
                {' '}
                {props.name}
                ?
              </h2>
              <button onClick={() => setOpen(false)} disabled={deleting} className="cursor-pointer text-white-75 hover:text-white disabled:opacity-50">
                <CloseIcon />
              </button>
            </div>

            <p className="mb-5 text-sm text-white-75">Their chats and generated media go with them. This cannot be undone.</p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-error-200 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? <SpinnerIcon /> : 'Delete permanently'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="cursor-pointer rounded-xl border border-black-40 py-3 text-sm font-semibold text-white transition-colors hover:border-white-25 disabled:opacity-50"
              >
                Keep character
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
