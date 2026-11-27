// #region Notify the configured Portal without sharing application state
export function notifyPortalNavigation() {
  if (window.parent === window) return;

  const localPortal = new URL(window.location.origin);
  localPortal.port = '5176';
  const portal = import.meta.env.VITE_PORTAL_ORIGIN || (import.meta.env.DEV ? localPortal.origin : '');
  if (!/^https?:\/\/[^/]+$/.test(portal)) return;

  const { pathname, search, hash } = window.location;
  window.parent.postMessage({ type: 'oneportal:navigation', path: pathname + search + hash }, portal);
}
// #endregion
