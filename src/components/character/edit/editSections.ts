export type EditSection = 'profile' | 'appearance' | 'details' | 'story';

/** Order the sections appear in the nav. */
export const editSectionOrder: EditSection[] = ['profile', 'appearance', 'details', 'story'];

export const editSectionMeta: Record<EditSection, { label: string; description: string }> = {
  profile: { label: 'Profile', description: 'Their avatar, and who can find them.' },
  appearance: { label: 'Appearance', description: 'Changing these updates how new images are generated; regenerate the avatar to match.' },
  details: { label: 'Details', description: 'Name, age and the traits that shape how they speak.' },
  story: { label: 'Story', description: 'Backstory, greeting and the prompts behind their personality.' },
};
