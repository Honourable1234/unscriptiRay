/**
 * Checks whether a string is safe to pass as `next/image`'s `src`.
 * The API sometimes returns bucket-relative storage paths instead of full URLs.
 * @param src - Candidate image URL.
 * @returns True if src is an absolute URL or a root-relative path.
 */
export const isValidImageSrc = (src?: string | null): src is string =>
  !!src && !src.startsWith('//') && (src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://'));
