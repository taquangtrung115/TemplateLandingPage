import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import LandingPageRenderer from '../components/templates/LandingPageRenderer';
import {
  getSafeCssColor,
  getSafeFontFamily,
  getSafeHttpUrl,
  getSafeLinkUrl,
  getSafeResourceUrl,
} from './safeUrl';

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getExportResourceUrl = (value) => {
  const safeUrl = getSafeResourceUrl(value);
  if (!safeUrl || !safeUrl.startsWith('/') || typeof window === 'undefined') return safeUrl;
  try {
    return new URL(safeUrl, window.location.origin).href;
  } catch {
    return null;
  }
};

const sanitizeConfig = (value, fieldName = '') => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeConfig(item));
  }
  if (!value || typeof value !== 'object') {
    if (typeof value !== 'string') return value;
    if (/^(?:ctaUrl|href)$/i.test(fieldName)) return getSafeLinkUrl(value) || '';
    if (/(?:url|src)$/i.test(fieldName)) return getExportResourceUrl(value) || '';
    if (/(?:color)$/i.test(fieldName)) return getSafeCssColor(value, '') || '';
    if (fieldName === 'fontFamily') return getSafeFontFamily(value, 'Playfair Display');
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key.toLowerCase() !== 'style')
      .map(([key, nestedValue]) => [key, sanitizeConfig(nestedValue, key)])
  );
};

const resolveResponseUrl = (value) => {
  if (typeof value !== 'string' || typeof window === 'undefined') return null;
  try {
    const candidate = value.trim();
    if (/[\u0000-\u001f\\]/.test(candidate) || candidate.includes('..')) return null;
    const parsed = new URL(candidate, window.location.origin);
    return getSafeHttpUrl(parsed.href)
      && parsed.origin === window.location.origin
      && /^\/p\/[^/]+\/v\/[1-9]\d*$/.test(parsed.pathname)
      ? parsed.href
      : null;
  } catch {
    return null;
  }
};

const getDownloadName = (title) => {
  const normalized = String(title || 'landing-page')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${normalized || 'landing-page'}.html`;
};

export const exportStandaloneHtml = (config, pageTitle = 'Thiệp Mời Điện Tử', options = {}) => {
  const safeConfig = sanitizeConfig(config && typeof config === 'object' ? config : {});
  const title = String(safeConfig?.hero?.title || pageTitle || 'Thiệp Mời Điện Tử');
  const fontFamily = getSafeFontFamily(safeConfig?.theme?.fontFamily, 'Playfair Display');
  const backgroundColor = getSafeCssColor(safeConfig?.theme?.backgroundColor, '#ffffff');
  const textColor = getSafeCssColor(safeConfig?.theme?.textColor, '#1e293b');
  const responseUrl = resolveResponseUrl(options?.publicUrl);
  const pageMarkup = renderToStaticMarkup(
    React.createElement(LandingPageRenderer, {
      config: safeConfig,
      customizationId: null,
      customizationVersionId: null,
      isPreview: true,
      exportMode: true,
      responseUrl,
    })
  );

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&family=Great+Vibes&family=Inter:wght@400;500;600;700&family=Lora:wght@400;600;700&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Nunito:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root { color-scheme: light; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      overflow-x: hidden;
      background-color: ${backgroundColor};
      color: ${textColor};
      font-family: '${fontFamily}', serif, system-ui;
    }
    .reveal-transition { opacity: 1 !important; transform: none !important; visibility: visible !important; animation: none !important; }
    .export-network-note { position: relative; z-index: 60; padding: 0.75rem 1rem; background: #fff7ed; color: #7c2d12; border-bottom: 1px solid #fed7aa; font: 12px/1.5 system-ui, sans-serif; text-align: center; }
    @media print { .export-network-note { position: static; } }
  </style>
</head>
<body>
  <aside class="export-network-note">Ảnh, video, bản đồ, âm thanh, font và Tailwind CDN bên ngoài file cần kết nối mạng. Phản hồi chỉ gửi được tại trang công khai khi có đường dẫn phiên bản.</aside>
  ${pageMarkup}
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = objectUrl;
  downloadLink.download = getDownloadName(title);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};
