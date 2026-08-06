const KEY = 'unscripti_return_url';

/** Persists where to send the user back to after they finish signing in. */
export const returnUrl = {
  save: (path: string) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(KEY, path);
    }
  },
  consume: (): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    const path = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    return path;
  },
};
