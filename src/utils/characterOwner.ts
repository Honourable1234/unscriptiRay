/**
 * Checks whether a character was created by the signed-in account. The API
 * reports ownership only as a `creator` handle, so it is matched against the
 * viewer's username; platform characters carry `@system` and never match.
 * @param options - Handles to compare.
 * @param options.creator - Creator handle from the character payload, e.g. `@luna`.
 * @param options.username - Username on the signed-in account, when it has one.
 * @returns True when both handles are present and name the same account.
 */
export const isCharacterOwner = (options: { creator?: string | null; username?: string | null }) => {
  const creator = options.creator?.trim().replace(/^@/, '').toLowerCase();
  const username = options.username?.trim().replace(/^@/, '').toLowerCase();
  return !!creator && !!username && creator === username;
};
