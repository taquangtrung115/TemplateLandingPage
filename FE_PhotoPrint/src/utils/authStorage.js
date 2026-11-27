import { workspaceKey } from './tenantScope';

const sessions = new Map();
export const authStorageKey = () => 'photoprint_auth:' + workspaceKey();

export function readAuthToken() {
  const key = authStorageKey();
  try {
    const value = window.localStorage.getItem(key);
    if (value === null && sessions.has(key)) return sessions.get(key);
    if (value) return JSON.parse(value)?.token || null;
  } catch { return sessions.get(key) || null; }
  return null;
}

export function writeAuthSession(token) {
  const key = authStorageKey();
  try {
    if (token) window.localStorage.setItem(key, JSON.stringify({ token }));
    else window.localStorage.removeItem(key);
    sessions.delete(key);
  } catch { sessions.set(key, token || null); }
}
