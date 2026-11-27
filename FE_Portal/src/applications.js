// #region Deployment origins
function readAppOrigin(value, localPort) {
  try {
    const local = new URL(window.location.origin);
    local.port = localPort;
    const url = value ? new URL(value) : import.meta.env.DEV ? local : null;
    if (!url) return null;

    const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    const isAllowed = url.protocol === 'https:' || (url.protocol === 'http:' && isLoopback);
    if (isAllowed && url.origin !== window.location.origin && url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password) {
      return url.origin;
    }
  } catch { /* An invalid deployment origin is handled in the app view. */ }
  return null;
}

const quotingOrigin = readAppOrigin(import.meta.env.VITE_QUOTING_ORIGIN, '5174');
const landingOrigin = readAppOrigin(import.meta.env.VITE_LANDING_ORIGIN, '5173');
const tenantOrigin = readAppOrigin(import.meta.env.VITE_TENANT_ORIGIN, '5175');
const photoPrintOrigin = readAppOrigin(import.meta.env.VITE_PHOTOPRINT_ORIGIN, '5177');
const origins = [quotingOrigin, landingOrigin, photoPrintOrigin, tenantOrigin];
const uniqueOrigin = origin => origin && origins.filter(value => value === origin).length === 1 ? origin : null;

export const Applications = [
  { key: 'quoting', name: 'Quoting', description: 'Quản lý khách hàng, sản phẩm và báo giá', origin: uniqueOrigin(quotingOrigin) },
  { key: 'landing', name: 'Landing Page', description: 'Tùy chỉnh mẫu, quản lý và xuất bản trang', origin: uniqueOrigin(landingOrigin) },
  { key: 'photoprint', name: 'Photo Print', description: 'Đặt in ảnh trực tuyến, kiểm tra DPI và thử khung 3D', origin: uniqueOrigin(photoPrintOrigin) },
];

export const PlatformApp = {
  key: 'platform',
  name: 'Quản trị nền tảng',
  origin: uniqueOrigin(tenantOrigin),
};
// #endregion
