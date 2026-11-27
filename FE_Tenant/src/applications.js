import { Aperture, FileText, PanelsTopLeft } from 'lucide-react';

export const applications = [
  { key: 'quoting', name: 'Quoting', icon: FileText, description: 'Sản phẩm, khách hàng và báo giá.' },
  { key: 'landing', name: 'Landing Page', icon: PanelsTopLeft, description: 'Thiết kế và xuất bản landing page.' },
  { key: 'photoprint', name: 'Photo Print', icon: Aperture, description: 'Sản phẩm ảnh, đơn in và hỗ trợ khách hàng.' },
];

export const getApplicationName = key => applications.find(item => item.key === key)?.name ?? key;

export function getPortalAdminUrl(tenantKey, appKey) {
  const local = new URL(window.location.origin);
  local.port = '5176';
  const configured = import.meta.env.VITE_PORTAL_ORIGIN || (import.meta.env.DEV ? local.origin : 'https://oneportal-workspace.vercel.app');
  try {
    const url = new URL(configured);
    if (url.origin !== configured || !['https:', 'http:'].includes(url.protocol)) return null;
    return new URL('/t/' + encodeURIComponent(tenantKey) + '/' + encodeURIComponent(appKey) + '/admin', url).href;
  } catch { return null; }
}
