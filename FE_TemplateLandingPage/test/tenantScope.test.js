import { describe, it, expect, afterEach } from 'vitest';
import { scopeRequest, assertCurrentScope, workspaceKey, workspaceBasename, workspacePublicUrl } from '../src/utils/tenantScope';
afterEach(() => window.history.replaceState({}, '', '/'));
describe('landing request isolation', () => {
  it('keeps shared page and version URLs inside the current workspace', () => {
    window.history.replaceState({}, '', '/t/acme/customize/one');
    expect(workspacePublicUrl('/p/our-page/v/1')).toBe(window.location.origin + '/t/acme/p/our-page/v/1');
    expect(workspacePublicUrl('/t/acme/p/our-page')).toBe(window.location.origin + '/t/acme/p/our-page');
    expect(workspacePublicUrl('javascript:alert(1)')).toBe('');
  });
  it('uses workspace links and a single application prefix', () => {
    window.history.replaceState({}, '', '/t/acme/products');
    const request = scopeRequest({ url: '/templates' });
    expect(new URL(request.baseURL, window.location.origin).pathname).toBe('/t/acme/api/v1/landing');
    expect(request.url).toBe('/templates');
    expect(workspaceKey()).toBe('acme'); expect(workspaceBasename()).toBe('/t/acme');
  });
  it('keeps identity login and context enumeration outside tenant APIs', () => {
    window.history.replaceState({}, '', '/t/acme/login');
    for (const url of ['/auth/login', '/auth/contexts']) expect(new URL(scopeRequest({ url }).baseURL, window.location.origin).pathname).toBe('/api/v1');
  });
  it('keeps member operations inside the selected tenant and app', () => {
    window.history.replaceState({}, '', '/t/company-b/members');
    expect(new URL(scopeRequest({ url: '/members' }).baseURL, window.location.origin).pathname).toBe('/t/company-b/api/v1/landing');
  });
  it('rejects late responses after a workspace switch', () => {
    window.history.replaceState({}, '', '/t/company-a/products'); const config = scopeRequest({ url: '/products' });
    window.history.replaceState({}, '', '/t/company-b/products');
    expect(() => assertCurrentScope({ config, data: ['private'] })).toThrow('Workspace');
  });
  it('assigns legacy routes to the fixed default workspace', () => {
    window.history.replaceState({}, '', '/products'); expect(workspaceKey()).toBe('landing-default');
  });
});
