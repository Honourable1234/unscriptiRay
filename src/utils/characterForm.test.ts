import type { CharacterDetail } from '@/services/useCharacterService';
import { describe, expect, it } from 'vitest';
import { characterToCreateState, createStateToUpdateBody } from './characterForm';

const character: CharacterDetail = {
  id: 'c1',
  name: 'Luna',
  age: 21,
  gender: 'Female',
  style: 'Realistic',
  image_url: null,
  short_bio: null,
  tags: ['Goth'],
  visibility: 'public',
  creator: '@luna',
  appearance: { hair_color: 'Black' },
  voice_settings: { voice_type: 'Soft' },
  personality_archetype: 'Tsundere',
  kinks: 'Praise',
  greeting_message: 'hey',
};

describe('characterToCreateState', () => {
  it('maps age to a string and gender to lower case', () => {
    const state = characterToCreateState(character);

    expect(state.age).toBe('21');
    expect(state.gender).toBe('female');
  });

  it('reads the voice type out of the settings object', () => {
    expect(characterToCreateState(character).voice).toBe('Soft');
  });

  it('wraps a single kink in an array', () => {
    expect(characterToCreateState(character).kinks).toEqual(['Praise']);
  });

  it('leaves fields the payload omits empty', () => {
    const state = characterToCreateState(character);

    expect(state.backstory).toBe('');
    expect(state.customPhysical).toBe('');
  });
});

describe('createStateToUpdateBody', () => {
  const initial = characterToCreateState(character);

  it('sends nothing when the form is untouched', () => {
    expect(createStateToUpdateBody(initial, initial)).toEqual({});
  });

  it('sends only the edited field', () => {
    expect(createStateToUpdateBody({ ...initial, name: 'Nova' }, initial)).toEqual({ name: 'Nova' });
  });

  it('omits fields the payload never sent and the user did not fill', () => {
    const body = createStateToUpdateBody({ ...initial, greeting: 'hi there' }, initial);

    expect(body).not.toHaveProperty('backstory');
    expect(body).not.toHaveProperty('personality_details');
    expect(body.greeting_message).toBe('hi there');
  });

  it('sends a cleared field the character had a value for', () => {
    expect(createStateToUpdateBody({ ...initial, greeting: '' }, initial)).toEqual({ greeting_message: '' });
  });

  it('sends age as a number and gender lower cased', () => {
    const body = createStateToUpdateBody({ ...initial, age: '22', gender: 'Male' }, initial);

    expect(body).toEqual({ age: 22, gender: 'male' });
  });

  it('sends arrays when their contents change', () => {
    const body = createStateToUpdateBody({ ...initial, tags: ['Goth', 'Roommate'], kinks: ['Praise'] }, initial);

    expect(body).toEqual({ tags: ['Goth', 'Roommate'] });
  });

  it('sends appearance when a trait changes', () => {
    const body = createStateToUpdateBody({ ...initial, appearance: { hair_color: 'Blonde' } }, initial);

    expect(body).toEqual({ appearance: { hair_color: 'Blonde' } });
  });
});
