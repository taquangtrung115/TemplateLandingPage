export const APP_KEY = 'photoprint';
export const DEFAULT_TENANT_KEY = 'photoprint-default';

const configuredBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const globalApiBase = configuredBase
  ? configuredBase.replace(/\/api\/v1$/, '') + '/api/v1'
  : '/api/v1';
const tenantPattern = /^\/t\/([a-z0-9][a-z0-9-]{1,62})(?:\/|$)/;
const globalRoutes = new Set(['/auth/login', '/auth/contexts']);

export function workspaceKey(path = window.location.pathname) {
  return path.match(tenantPattern)?.[1] || DEFAULT_TENANT_KEY;
}

export function workspaceBasename(path = window.location.pathname) {
  const key = path.match(tenantPattern)?.[1];
  return key ? '/t/' + key : '';
}

export function workspaceApiBase(key = workspaceKey()) {
  const origin = configuredBase ? new URL(globalApiBase, window.location.origin).origin : '';
  return origin + '/t/' + encodeURIComponent(key) + '/api/v1/' + APP_KEY;
}

export function scopeRequest(config) {
  if (!/^\/(?![\/\\])/.test(config.url || '') || /[\\\u0000-\u001f]/.test(config.url)) {
    throw new Error('Địa chỉ API không hợp lệ.');
  }
  config.workspace = workspaceKey();
  config.baseURL = globalRoutes.has(config.url) ? globalApiBase : workspaceApiBase(config.workspace);
  return config;
}

export function assertCurrentScope(response) {
  if (response?.config?.workspace && response.config.workspace !== workspaceKey()) {
    throw Object.assign(new Error('Workspace đã thay đổi.'), { code: 'ERR_CANCELED' });
  }
  return response;
}

export function navigateWorkspace(key) {
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(key)) throw new Error('Workspace không hợp lệ.');
  const { pathname, search, hash } = window.location;
  let route = pathname.slice(workspaceBasename().length) || '/';
  if (route === '/login' || route === '/register') route = '/admin';
  window.location.assign('/t/' + key + route + search + hash);
}
