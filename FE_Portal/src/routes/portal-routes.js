// #region Workspace and app routes
export const WorkspaceKeyPattern = /^[a-z0-9][a-z0-9-]{1,62}$/;
export const PlatformPath = '/platform';
export const AdminPath = '/admin';

export function isAdminPath(path) {
  return /^\/admin(?:\/|$)/.test(path);
}

export function storefrontLocation(origin, tenantKey, appKey, route = '/', suffix = '') {
  const legacyDefault = tenantKey === appKey + '-default';
  const path = legacyDefault ? route : workspacePath(tenantKey, null, route);
  const url = new URL(origin);
  url.pathname = path;
  return url.href + suffix;
}

export function workspacePath(tenantKey, appKey, subpath = '', suffix = '') {
  return `/t/${tenantKey}${appKey ? `/${appKey}` : ''}${subpath}${suffix}`;
}

export function readPortalRoute(url) {
  const { pathname, search, hash } = url;
  if (pathname === '/') return { page: 'home' };
  if (pathname === PlatformPath || pathname === `${PlatformPath}/`) return { page: 'platform', search };

  const match = /^\/t\/([a-z0-9][a-z0-9-]{1,62})(?:\/([^/]+)(\/.*)?)?\/?$/.exec(pathname);
  if (!match) return { page: 'notFound' };

  const [, tenantKey, appKey, subpath = ''] = match;
  return { page: 'workspace', tenantKey, appKey, subpath, suffix: search + hash };
}

export function readEmbeddedLocation(path, appOrigin, appKey) {
  if (typeof path !== 'string' || !path.startsWith('/t/') || path.includes('\\')) return null;

  const url = new URL(path, appOrigin);
  const match = /^\/t\/([a-z0-9][a-z0-9-]{1,62})(\/.*)?$/.exec(url.pathname);
  if (url.origin !== appOrigin || !match) return null;

  const [, tenantKey, subpath = ''] = match;
  return { tenantKey, url: url.href, portalPath: workspacePath(tenantKey, appKey, subpath, url.search + url.hash) };
}
// #endregion
