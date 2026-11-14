// #region Workspace address and request scope
export const APP_KEY = 'quoting';
export const DEFAULT_TENANT_KEY = 'quoting-default';
const configured = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
export const globalApiBase = configured ? (configured.endsWith('/api/v1') ? configured : configured + '/api/v1') : '/api/v1';
export const apiOrigin = (() => { try { return new URL(globalApiBase, window.location.origin).origin; } catch { return ''; } })();
export function workspaceKey(path = window.location.pathname) {
  const match = path.match(/^\/t\/([a-z0-9][a-z0-9-]{1,62})(?:\/|$)/);
  return match?.[1] || DEFAULT_TENANT_KEY;
}
export function workspaceBasename(path = window.location.pathname) {
  return path.match(/^\/t\/([a-z0-9][a-z0-9-]{1,62})(?:\/|$)/)?.[0].replace(/\/$/, '') || '';
}
export function workspaceApiBase(key = workspaceKey()) {
  const origin = configured ? apiOrigin : '';
  return origin + '/t/' + encodeURIComponent(key) + '/api/v1/' + APP_KEY;
}
export function scopeRequest(config) {
  const url = config.url || '';
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) throw new Error('API requests must use an application-relative address.');
  const global = url.startsWith('/auth/login') || url.startsWith('/auth/contexts');
  config.baseURL = global ? globalApiBase : workspaceApiBase();
  if (!global && config.url?.startsWith('/quoting/')) config.url = config.url.slice('/quoting'.length);
  config.__workspace = workspaceKey();
  return config;
}
export function assertCurrentScope(response) {
  if (response.config?.__workspace && response.config.__workspace !== workspaceKey()) {
    const error = new Error('Workspace đã thay đổi.'); error.code = 'ERR_CANCELED'; throw error;
  }
  return response;
}
export function navigateWorkspace(key) {
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(key)) throw new Error('Workspace không hợp lệ.');
  const basename = workspaceBasename();
  const path = window.location.pathname.slice(basename.length) || '/';
  window.location.assign('/t/' + key + (path === '/login' || path === '/register' ? '/' : path) + window.location.search + window.location.hash);
}
// #endregion
