'use client';

import { useState } from 'react';

const read = <T>(key: string, initial: T): T => {
  if (typeof window === 'undefined') {
    return initial;
  }
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  } catch {
    return initial;
  }
};

/**
 * Like `useState`, but mirrors the value to `sessionStorage` under `key` so it
 * survives navigating away and back, while still resetting whenever `key` changes.
 * @param key - Storage key; give each independent field its own key.
 * @param initial - Value used when nothing is stored yet.
 */
export function useSessionState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => read(key, initial));

  const set = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
      sessionStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    });
  };

  return [value, set] as const;
}

/**
 * Removes every persisted `useSessionState` field under a key prefix, e.g. when
 * leaving a mode whose fields should not carry over if the user returns to it.
 * @param prefix - Key prefix shared by the fields to clear.
 */
export const clearSessionState = (prefix: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith(prefix)) {
      sessionStorage.removeItem(key);
    }
  }
};
