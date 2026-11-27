import { describe, expect, it } from 'vitest';
import { evaluatePhotoPrintQuality, getPhotoBox, orientPrintSize } from '../src/utils/photoQuality';
import { calculatePhotoPrintPrice, orderItemPayload } from '../src/utils/photoPricing';
import { resolveMessengerUrl, resolveZaloUrl, generateQrDataUrl } from '../src/utils/socialLinks';
import { uploadPhotoBatch, validateUpload } from '../src/utils/fileUpload';
import { assertCurrentScope, scopeRequest, workspaceKey } from '../src/utils/tenantScope';

describe('Photo quality and price', () => {
  it('aligns landscape and portrait print dimensions before calculating DPI', () => {
    expect(orientPrintSize(4000, 3000, 10, 15)).toEqual({ widthCm: 15, heightCm: 10 });
    expect(evaluatePhotoPrintQuality(3000, 4000, 10, 15)).toEqual(evaluatePhotoPrintQuality(3000, 4000, 15, 10));
    expect(evaluatePhotoPrintQuality(3000, 4000, 10, 15)).toMatchObject({ dpi: 677, level: 'high' });
    expect(evaluatePhotoPrintQuality(1000, 1000, 10, 15)).toMatchObject({ dpi: 169, level: 'medium' });
    expect(evaluatePhotoPrintQuality(300, 400, 10, 15)).toMatchObject({ dpi: 67, level: 'low' });
    expect(evaluatePhotoPrintQuality(300, 400, 0, 0).dpi).toBe(0);
  });

  it('uses the focal point for Fill and centers all pixels for Fit', () => {
    expect(getPhotoBox(100, 100, 200, 100, { focalX: .9 })).toEqual({ x: -90, y: 0, width: 200, height: 100 });
    expect(getPhotoBox(100, 100, 200, 100, { fitMode: 'Fit', focalY: .1 })).toEqual({ x: 0, y: 25, width: 100, height: 50 });
  });

  it('applies the highest matching tier after surface, finish and rush fees', () => {
    expect(calculatePhotoPrintPrice({
      pricingMode: 'PerPrintSizeTier', basePrice: 1500, sizePrice: 2500, surfacePrice: 800, widthCm: 10, heightCm: 15,
      quantity: 20, selectedFinishing: [{ price: 500, mode: 'PerUnit' }],
      discountTiers: [{ minQty: 50, discountPercent: 15 }, { minQty: 20, discountPercent: 10 }], rushSurchargePercent: 25,
    })).toMatchObject({ unitBaseCost: 2500, surfaceCost: 800, finishingCost: 500, rushFee: 950, discountTotal: 9500, unitFinalPrice: 4275, lineTotal: 85500 });
  });

  it('bills the minimum area and removes client pricing from checkout', () => {
    expect(calculatePhotoPrintPrice({ pricingMode: 'PerSqm', basePrice: 100000, widthCm: 5, heightCm: 5,
      minBillableAreaSqm: .2, quantity: 2, surfacePrice: 10000, surfacePricingUnit: 'PerSqm' }).lineTotal).toBe(44000);
    expect(orderItemPayload({ productId: 'product', lineTotal: 1, unitPrice: 1, photoFiles: [] })).not.toHaveProperty('lineTotal');
  });
});

describe('Workspace boundaries and contact links', () => {
  it('scopes application routes and rejects an absolute request or a stale response', () => {
    expect(workspaceKey('/t/example/services')).toBe('example');
    expect(scopeRequest({ url: '/products' }).baseURL).toBe('/t/photoprint-default/api/v1/photoprint');
    expect(scopeRequest({ url: '/auth/login' }).baseURL).toBe('/api/v1');
    expect(() => scopeRequest({ url: '//elsewhere.example/products' })).toThrow();
    expect(() => assertCurrentScope({ config: { workspace: 'different' } })).toThrow();
  });

  it('normalizes supported Messenger and Zalo addresses and sanitizes host overrides', () => {
    expect(resolveMessengerUrl({ messengerEnabled: true, messengerPageIdOrUsername: ' @studio.anh ' }, 'Mã PA')).toBe('https://m.me/studio.anh?text=M%C3%A3+PA');
    expect(resolveZaloUrl({ zaloEnabled: true, zaloPhoneOrOaId: '+84 912 345 678' })).toBe('https://zalo.me/0912345678');
    expect(resolveMessengerUrl({ messengerEnabled: true, messengerLinkOverride: 'https://m.me.evil.test/c' })).toBeNull();
    expect(resolveMessengerUrl({ messengerEnabled: true, messengerLinkOverride: 'javascript:alert(1)' })).toBeNull();
    expect(resolveZaloUrl({ zaloEnabled: true, zaloLinkOverride: 'http://zalo.me/studio' })).toBeNull();
    expect(() => validateUpload(new File(['x'], 'z.svg', { type: 'image/png' }))).toThrow();
    return expect(generateQrDataUrl('javascript:alert(1)')).rejects.toThrow();
  });
});

describe('Batch uploads', () => {
  it('limits concurrent work to three, retries transient failures, and preserves order', async () => {
    let active = 0, peak = 0, attempts = 0;
    const progress = [];
    const results = await uploadPhotoBatch([1, 2, 3, 4, 5], async item => {
      active++;
      peak = Math.max(peak, active);
      await new Promise(resolve => setTimeout(resolve, 5));
      active--;
      if (item === 2 && ++attempts === 1) throw Object.assign(new Error('retry'), { status: 503 });
      return item * 2;
    }, { onProgress: count => progress.push(count) });
    expect(peak).toBe(3);
    expect(attempts).toBe(2);
    expect(results).toEqual([2, 4, 6, 8, 10]);
    expect(progress).toEqual([1, 2, 3, 4, 5]);
  });

  it('retains progress from completed uploads when a non-retriable file fails', async () => {
    const successes = [];
    await expect(uploadPhotoBatch([1, 2], async value => {
      if (value === 2) throw Object.assign(new Error('invalid image'), { status: 400 });
      return value;
    }, { onProgress: (_, __, value) => successes.push(value) })).rejects.toThrow('invalid image');
    expect(successes).toEqual([1]);
  });
});
