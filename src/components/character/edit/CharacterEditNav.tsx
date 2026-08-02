'use client';

import type { EditSection } from './editSections';
import { useTranslations } from 'next-intl';
import { ChevronRightIcon, EditIcon, MemoryIcon, PictureIcon, ProfileIcon } from '@/components/icons';
import { editSectionOrder, useEditSectionMeta } from './editSections';

const icons: Record<EditSection, React.ReactNode> = {
  profile: <ProfileIcon />,
  appearance: <PictureIcon />,
  details: <EditIcon />,
  story: <MemoryIcon />,
};

/**
 * Section list for the edit page, styled like the chat sidebar, so one form
 * opens at a time instead of every form stacking on one page.
 * @param props - Component props.
 * @param props.active - Section currently open, or null while the list is showing.
 * @param props.onSelect - Called with the section the user picked.
 */
export const CharacterEditNav = (props: { active: EditSection | null; onSelect: (section: EditSection) => void }) => {
  const t = useTranslations('CharacterEditNav');
  const editSectionMeta = useEditSectionMeta();

  return (
    <nav className="flex flex-col gap-1 rounded-2xl border border-black-40 bg-black-100 p-3">
      <span className="px-3 pt-1 pb-2 text-sm font-semibold text-white">{t('title')}</span>

      {editSectionOrder.map((section) => {
        const isActive = props.active === section;

        return (
          <button
            key={section}
            type="button"
            onClick={() => props.onSelect(section)}
            className={`flex cursor-pointer items-center gap-2 rounded-xl p-3 text-sm font-medium transition-colors ${isActive ? 'bg-primary-100/20 text-primary-100' : 'text-white hover:bg-black-40 hover:text-white/75'}`}
          >
            {icons[section]}
            <span className="flex-1 text-left">{editSectionMeta[section].label}</span>
            <span className="h-6 w-6 overflow-hidden lg:hidden [&>svg]:h-6 [&>svg]:w-3"><ChevronRightIcon /></span>
          </button>
        );
      })}
    </nav>
  );
};
