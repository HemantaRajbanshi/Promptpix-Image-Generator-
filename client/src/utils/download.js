/**
 * Download an image from a blob
 * @param {Blob} blob - The image blob
 * @param {string} filename - The filename to save as
 */
export const downloadImage = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
