import { describe, it, expect, afterEach } from 'vitest';
import { scopeRequest, assertCurrentScope, workspaceKey, workspaceBasename } from '../src/utils/tenantScope';
afterEach(() => window.history.replaceState({}, '', '/'));
describe('quoting request isolation', () => {
  it('uses workspace links and a single application prefix', () => {
    window.history.replaceState({}, '', '/t/acme/products');
    const request = scopeRequest({ url: '/quoting/products' });
    expect(new URL(request.baseURL, window.location.origin).pathname).toBe('/t/acme/api/v1/quoting');
    expect(request.url).toBe('/products');
    expect(workspaceKey()).toBe('acme'); expect(workspaceBasename()).toBe('/t/acme');
  });
  it('keeps identity login and context enumeration outside tenant APIs', () => {
    window.history.replaceState({}, '', '/t/acme/login');
    for (const url of ['/auth/login', '/auth/contexts']) expect(new URL(scopeRequest({ url }).baseURL, window.location.origin).pathname).toBe('/api/v1');
  });
  it('keeps member operations inside the selected tenant and app', () => {
    window.history.replaceState({}, '', '/t/company-b/members');
    expect(new URL(scopeRequest({ url: '/members' }).baseURL, window.location.origin).pathname).toBe('/t/company-b/api/v1/quoting');
  });
  it('rejects late responses after a workspace switch', () => {
    window.history.replaceState({}, '', '/t/company-a/products'); const config = scopeRequest({ url: '/products' });
    window.history.replaceState({}, '', '/t/company-b/products');
    expect(() => assertCurrentScope({ config, data: ['private'] })).toThrow('Workspace');
  });
  it('assigns legacy routes to the fixed default workspace', () => {
    window.history.replaceState({}, '', '/products'); expect(workspaceKey()).toBe('quoting-default');
  });
});
