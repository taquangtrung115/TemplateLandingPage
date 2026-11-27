const unsafeCharacters = /[\u0000-\u001f\u007f\\]/;

export function getSafeHttpUrl(value) {
  if (typeof value !== 'string' || unsafeCharacters.test(value)) return null;
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}

export function getSafeResourceUrl(value) {
  if (typeof value !== 'string' || unsafeCharacters.test(value)) return null;
  if (/^\/(?!\/)/.test(value)) {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin ? url.pathname + url.search + url.hash : null;
  }
  return getSafeHttpUrl(value);
}

export function sanitizePhone(value = '') {
  const phone = String(value).trim().replace(/[\s().-]/g, '');
  return /^\+?\d{8,15}$/.test(phone) ? phone : null;
}
