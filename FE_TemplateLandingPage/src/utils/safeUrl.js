const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const CSS_COLOR = /^(?:#[\da-f]{3,8}|(?:rgb|rgba|hsl|hsla)\([\d.%\s,+/-]+\)|[a-z]{1,24}|transparent|currentcolor)$/i;

export const getSafeLinkUrl = (value) => {
  if (typeof value !== 'string') return null;

  const candidate = value.trim();
  if (!candidate || CONTROL_CHARACTERS.test(candidate) || candidate.includes('\\')) return null;

  if (/^#[A-Za-z][\w:.-]*$/.test(candidate)) return candidate;

  if (/^tel:/i.test(candidate)) {
    const phone = candidate.slice(candidate.indexOf(':') + 1).replace(/[\s().-]/g, '');
    return /^\+?[\d*#]{3,32}$/.test(phone) ? `tel:${phone}` : null;
  }

  if (/^mailto:/i.test(candidate)) {
    const recipient = candidate.slice(candidate.indexOf(':') + 1);
    if (!recipient || /[\s<>"']/.test(recipient) || !/^[^@?]+@[^@?]+\.[^@?]+/.test(recipient)) return null;
    try {
      const parsed = new URL(candidate);
      return parsed.protocol === 'mailto:' ? candidate : null;
    } catch {
      return null;
    }
  }

  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
};

export const getSafeResourceUrl = (value) => {
  if (typeof value !== 'string') return null;

  const candidate = value.trim();
  if (!candidate || CONTROL_CHARACTERS.test(candidate) || candidate.includes('\\')) return null;

  if (/^data:image\/(?:png|jpeg|jpg|gif|webp);base64,[a-z\d+/]+=*$/i.test(candidate)) {
    return candidate;
  }

  if (candidate.startsWith('/') && !candidate.startsWith('//') && !candidate.includes('..')) {
    try {
      const origin = typeof window === 'undefined' ? 'https://safe.invalid' : window.location.origin;
      const parsed = new URL(candidate, origin);
      return parsed.origin === origin ? `${parsed.pathname}${parsed.search}${parsed.hash}` : null;
    } catch {
      return null;
    }
  }

  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
};

export const getSafeHttpUrl = (value) => {
  const safeUrl = getSafeLinkUrl(value);
  return safeUrl && /^https?:/i.test(safeUrl) ? safeUrl : null;
};

export const getSafeCssUrl = (value) => {
  const resourceUrl = getSafeResourceUrl(value);
  if (!resourceUrl) return null;
  const escaped = resourceUrl.replace(/["\\\n\r]/g, '\\$&');
  return `url("${escaped}")`;
};

export const getSafeCssColor = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  const candidate = value.trim();
  return CSS_COLOR.test(candidate) ? candidate : fallback;
};

export const getSafeFontFamily = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  const candidate = value.trim();
  if (!candidate || candidate.length > 120 || /[^a-z\d\s,_-]/i.test(candidate)) {
    return fallback;
  }
  return candidate;
};
