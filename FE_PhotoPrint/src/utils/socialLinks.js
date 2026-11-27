import QRCode from 'qrcode';
import { getSafeHttpUrl, sanitizePhone } from './safeUrl';

const messengerHosts = new Set(['m.me', 'messenger.com', 'www.messenger.com', 'facebook.com', 'www.facebook.com']);
const zaloHosts = new Set(['zalo.me', 'oa.zalo.me', 'chat.zalo.me']);

function validateSocialHost(value, hosts) {
  const raw = String(value || '').trim();
  if (!raw || raw.startsWith('/') || raw.includes('\\')) return null;
  const safe = getSafeHttpUrl(/^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : 'https://' + raw);
  if (!safe) return null;
  const url = new URL(safe);
  return url.protocol === 'https:' && !url.port && hosts.has(url.hostname) ? url : null;
}

export function resolveMessengerUrl(config, prefillMessage = '') {
  if (!config?.messengerEnabled) return null;
  const id = String(config.messengerPageIdOrUsername || '').trim().replace(/^@+/, '').replace(/^[\/\s]+|[\/\s]+$/g, '');
  const url = config.messengerLinkOverride?.trim()
    ? validateSocialHost(config.messengerLinkOverride, messengerHosts)
    : /^[a-z\d.]+$/i.test(id) ? new URL('https://m.me/' + encodeURIComponent(id)) : null;
  if (!url) return null;
  const text = prefillMessage || config.messengerPrefillText;
  if (text && url.hostname === 'm.me') url.searchParams.set('text', text);
  return url.href;
}

export function resolveZaloUrl(config) {
  if (!config?.zaloEnabled) return null;
  if (config.zaloLinkOverride?.trim()) return validateSocialHost(config.zaloLinkOverride, zaloHosts)?.href || null;
  const raw = String(config.zaloPhoneOrOaId || '').trim().replace(/^@+/, '');
  const phone = sanitizePhone(raw);
  const id = phone ? phone.replace(/^\+84(?=\d{9,10}$)/, '0') : raw;
  return /^[a-z\d_+\-]+$/i.test(id) ? 'https://zalo.me/' + encodeURIComponent(id) : null;
}

export function generateQrDataUrl(targetUrl, options = { width: 320, margin: 2 }) {
  const url = getSafeHttpUrl(targetUrl);
  if (!url) return Promise.reject(new Error('Liên kết QR không hợp lệ.'));
  return QRCode.toDataURL(url, options);
}
