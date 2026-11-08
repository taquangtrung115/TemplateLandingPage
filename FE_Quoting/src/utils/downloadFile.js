// #region Browser download
export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Let the browser start reading the object URL before releasing it.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
// #endregion
