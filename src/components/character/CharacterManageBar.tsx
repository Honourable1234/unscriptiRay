'use client';

import { EditIcon } from '@/components/icons';
import { Link } from '@/libs/I18nNavigation';

/**
 * Entry point to the edit page; rendered only for the character's creator.
 * @param props - Component props.
 * @param props.id - Character being managed.
 */
export const CharacterManageBar = (props: { id: string }) => (
  <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black-60 px-4 py-3">
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-semibold text-white">This is your AI</span>
      <span className="text-xs text-white-75">Edit their details, change who can see them, or delete them.</span>
    </div>
    <Link
      href={`/character/${props.id}/edit`}
      className="flex items-center gap-2 rounded-xl border border-black-20 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-primary-100 hover:text-primary-100"
    >
      <EditIcon />
      Manage AI
    </Link>
  </div>
);
