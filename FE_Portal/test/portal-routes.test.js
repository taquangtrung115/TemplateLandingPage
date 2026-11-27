import assert from 'node:assert/strict';
import test from 'node:test';
import { isAdminPath, readEmbeddedLocation, readPortalRoute, storefrontLocation, workspacePath } from '../src/routes/portal-routes.js';

test('Admin routes stay in Portal and storefront links use the application origin', () => {
  assert.equal(isAdminPath('/admin/orders'), true);
  assert.equal(isAdminPath('/services'), false);
  assert.equal(isAdminPath('/administrator'), false);
  assert.equal(storefrontLocation('https://photos.example.test', 'photoprint-default', 'photoprint', '/services', '?q=10x15#result'),
    'https://photos.example.test/services?q=10x15#result');
  assert.equal(storefrontLocation('https://photos.example.test', 'acme', 'photoprint', '/services'),
    'https://photos.example.test/t/acme/services');
});

test('Portal preserves the tenant, deep link and URL parameters', () => {
  const url = new URL('https://portal.example.test/t/acme/quoting/quotations/123?mode=edit#summary');
  const { page, tenantKey, appKey, subpath, suffix } = readPortalRoute(url);
  assert.equal(page, 'workspace');
  assert.equal(tenantKey, 'acme');
  assert.equal(appKey, 'quoting');
  assert.equal(workspacePath(tenantKey, null, subpath, suffix), '/t/acme/quotations/123?mode=edit#summary');
});

test('Only workspace paths from the embedded app become Portal links', () => {
  const origin = 'https://landing.example.test';
  assert.equal(readEmbeddedLocation('//other.test/t/acme/login', origin, 'landing'), null);
  assert.equal(readEmbeddedLocation('/t/../api/v1', origin, 'landing'), null);
  assert.equal(readEmbeddedLocation('/t/acme\\..\\..\\platform', origin, 'landing'), null);
  assert.deepEqual(readEmbeddedLocation('/t/next-site/login?q=1', origin, 'landing'), {
    tenantKey: 'next-site',
    url: `${origin}/t/next-site/login?q=1`,
    portalPath: '/t/next-site/landing/login?q=1',
  });
});
