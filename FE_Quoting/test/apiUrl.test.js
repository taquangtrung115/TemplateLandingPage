import { describe, it, expect, vi, afterEach } from 'vitest';
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });
describe('API assets on a separate frontend domain', () => {
  it('uses the configured API host for relative product image URLs', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test/api/v1'); vi.resetModules();
    const { apiBaseUrl, resolveApiAssetUrl } = await import('../src/api/apiUrl');
    expect(apiBaseUrl).toBe('https://api.example.test/api/v1');
    expect(resolveApiAssetUrl('/api/v1/quoting/product-images/CB-01.png')).toBe('https://api.example.test/api/v1/quoting/product-images/CB-01.png');
    expect(resolveApiAssetUrl('https://images.example.test/photo.png')).toBe('https://images.example.test/photo.png'); expect(resolveApiAssetUrl('javascript:alert(1)')).toBe('');
  });
  it('keeps local image requests on the Vite proxy without an API override', async () => {
    vi.stubEnv('VITE_API_BASE_URL', ''); vi.resetModules(); const { resolveApiAssetUrl } = await import('../src/api/apiUrl');
    expect(resolveApiAssetUrl('/api/v1/quoting/product-images/CB-01.png')).toBe('/api/v1/quoting/product-images/CB-01.png');
  });
});
