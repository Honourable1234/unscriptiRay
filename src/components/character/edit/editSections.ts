'use client';

import { useTranslations } from 'next-intl';

export type EditSection = 'profile' | 'appearance' | 'details' | 'story';

/** Order the sections appear in the nav. */
export const editSectionOrder: EditSection[] = ['profile', 'appearance', 'details', 'story'];

/**
 * Titles and blurbs for the edit sections, shared by the nav and the open pane.
 * @returns The label and description for every section, in the active locale.
 */
export const useEditSectionMeta = (): Record<EditSection, { label: string; description: string }> => {
  const t = useTranslations('CharacterEditSections');

  return {
    profile: { label: t('profile_label'), description: t('profile_description') },
    appearance: { label: t('appearance_label'), description: t('appearance_description') },
    details: { label: t('details_label'), description: t('details_description') },
    story: { label: t('story_label'), description: t('story_description') },
  };
};
