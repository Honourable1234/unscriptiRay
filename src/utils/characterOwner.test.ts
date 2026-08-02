import { describe, expect, it } from 'vitest';
import { isCharacterOwner } from './characterOwner';

describe('isCharacterOwner', () => {
  it('matches a creator handle against the same username', () => {
    expect(isCharacterOwner({ creator: '@luna', username: 'luna' })).toBe(true);
  });

  it('matches regardless of case or a leading at sign on either side', () => {
    expect(isCharacterOwner({ creator: 'Luna', username: '@LUNA' })).toBe(true);
  });

  it('rejects a different creator', () => {
    expect(isCharacterOwner({ creator: '@luna', username: 'nova' })).toBe(false);
  });

  it('rejects platform characters', () => {
    expect(isCharacterOwner({ creator: '@system', username: 'luna' })).toBe(false);
  });

  it('rejects an account without a username', () => {
    expect(isCharacterOwner({ creator: '@luna', username: null })).toBe(false);
  });

  it('rejects a character without a creator', () => {
    expect(isCharacterOwner({ creator: null, username: 'luna' })).toBe(false);
  });
});
