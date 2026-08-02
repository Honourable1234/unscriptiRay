import type { CreateState } from '@/context/CreateContext';
import type { CharacterDetail, UpdateCharacterBody } from '@/services/useCharacterService';

/**
 * Reads the voice type out of either payload shape the API sends.
 * @param settings - `voice_settings` as a plain type name or an object.
 * @returns The voice type, or an empty string when the character has none.
 */
const voiceType = (settings: CharacterDetail['voice_settings']) => {
  if (typeof settings === 'string') {
    return settings;
  }
  return settings?.voice_type ?? '';
};

/**
 * Maps a saved character onto the create form state so the same steps can edit it.
 * @param character - Character as returned by `GET /characters/{id}`.
 * @returns Form state seeded with every field the character exposes.
 */
export const characterToCreateState = (character: CharacterDetail): CreateState => ({
  style: character.style,
  appearance: { ...character.appearance },
  name: character.name ?? '',
  age: character.age === null || character.age === undefined ? '' : String(character.age),
  gender: character.gender?.toLowerCase() ?? '',
  voice: voiceType(character.voice_settings),
  personality: character.personality_archetype ?? '',
  relationship: character.relationship_dynamic ?? '',
  kinks: Array.isArray(character.kinks) ? character.kinks : (character.kinks ? [character.kinks] : []),
  socialRole: character.hobby ?? '',
  backstory: character.backstory ?? '',
  scenario: character.scenario ?? '',
  personalityDetails: character.personality_details ?? '',
  customPhysical: character.custom_physical_prompt ?? '',
  customFaceDetails: character.custom_face_prompt ?? '',
  greeting: character.greeting_message ?? '',
  tags: character.tags ?? [],
});

/** Text fields that map one-to-one between the form and the update body. */
const textFields: { field: keyof CreateState; apiKey: keyof UpdateCharacterBody }[] = [
  { field: 'name', apiKey: 'name' },
  { field: 'voice', apiKey: 'voice_type' },
  { field: 'personality', apiKey: 'personality_archetype' },
  { field: 'relationship', apiKey: 'relationship_dynamic' },
  { field: 'socialRole', apiKey: 'hobby' },
  { field: 'backstory', apiKey: 'backstory' },
  { field: 'personalityDetails', apiKey: 'personality_details' },
  { field: 'customPhysical', apiKey: 'custom_physical_prompt' },
  { field: 'customFaceDetails', apiKey: 'custom_face_prompt' },
  { field: 'greeting', apiKey: 'greeting_message' },
];

/**
 * Builds the `PATCH /characters/{id}` body from what the form actually changed.
 * The API hides some fields from non-owners, so a field the payload never sent
 * seeds as empty; sending only edited fields keeps that from wiping it.
 * @param data - Current form state.
 * @param initial - Form state the character was loaded with.
 * @returns Update body holding just the changed fields.
 */
export const createStateToUpdateBody = (data: CreateState, initial: CreateState): UpdateCharacterBody => {
  const body: UpdateCharacterBody = {};

  for (const { field, apiKey } of textFields) {
    const value = data[field];
    if (typeof value === 'string' && value !== initial[field]) {
      Object.assign(body, { [apiKey]: value.trim() });
    }
  }

  if (data.style && data.style !== initial.style) {
    body.style = data.style;
  }

  if (JSON.stringify(data.appearance) !== JSON.stringify(initial.appearance)) {
    body.appearance = data.appearance;
  }

  const age = Number(data.age);
  if (data.age.trim() && Number.isFinite(age) && data.age !== initial.age) {
    body.age = age;
  }

  if (data.gender && data.gender !== initial.gender) {
    body.gender = data.gender.toLowerCase();
  }

  if (data.kinks.join('|') !== initial.kinks.join('|')) {
    body.kinks = data.kinks;
  }

  if (data.tags.join('|') !== initial.tags.join('|')) {
    body.tags = data.tags;
  }

  return body;
};
