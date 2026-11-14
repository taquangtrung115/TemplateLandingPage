import { workspaceApiBase, apiOrigin } from '../utils/tenantScope';
// #region API and public asset addresses
const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');
export const apiBaseUrl = configuredUrl
  ? (configuredUrl.endsWith('/api/v1') ? configuredUrl : `${configuredUrl}/api/v1`)
  : '/api/v1';

export function resolveApiAssetUrl(value) {
  if (!value) return '';
  if (value.startsWith('/t/')) return apiOrigin + value;
  if (value.startsWith('/api/v1/quoting/')) return workspaceApiBase() + value.slice('/api/v1/quoting'.length);
  if (value.startsWith('/api/') && configuredUrl) {
    try { return new URL(value, new URL(apiBaseUrl, window.location.origin)).href; } catch { return ''; }
  }
  if (value.startsWith('/api/')) return value;
  try { const url = new URL(value); return ['http:', 'https:', 'data:'].includes(url.protocol) ? value : ''; } catch { return ''; }
}
// #endregion
