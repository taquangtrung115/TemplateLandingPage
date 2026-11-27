export function notifyPortalNavigation() {
  if (window.parent === window) return;
  const localPortal = new URL(window.location.origin);
  localPortal.port = '5176';
  const configured = import.meta.env.VITE_PORTAL_ORIGIN || (import.meta.env.DEV ? localPortal.origin : 'https://oneportal-workspace.vercel.app');
  try {
    const portal = new URL(configured);
    if (portal.origin !== configured || !['https:', 'http:'].includes(portal.protocol)) return;
    const { pathname, search, hash } = window.location;
    window.parent.postMessage({ type: 'oneportal:navigation', path: pathname + search + hash }, portal.origin);
  } catch { /* Standalone installations may omit the Portal. */ }
}
