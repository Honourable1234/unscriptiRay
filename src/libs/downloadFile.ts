/**
 * Saves a remote file to the user's device under a chosen name.
 *
 * Reads the file into a blob first: storage buckets serve assets inline, which
 * makes a plain `download` link open the file in a tab instead of saving it.
 * @param url - Absolute URL of the file to save.
 * @param filename - Name to save the file under.
 * @returns A promise that resolves once the browser has taken the download.
 * @throws {Error} When the file cannot be read, e.g. the bucket blocks cross-origin requests.
 */
export const downloadFile = async (url: string, filename: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const href = URL.createObjectURL(await res.blob());
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Safari cancels the download if the blob URL is revoked in the same tick.
  setTimeout(() => URL.revokeObjectURL(href), 1000);
};
