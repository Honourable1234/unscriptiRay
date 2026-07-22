const KEY = 'unscripti_guest_token';

/** Persists the anonymous chat guest token across reloads. */
export const guestToken = {
  get: (): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(KEY);
  },
  set: (value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(KEY, value);
    }
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(KEY);
    }
  },
};
