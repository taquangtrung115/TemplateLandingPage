import { describe, it, expect } from 'vitest';
import { calculateQuotation } from '../src/utils/quotationCalculation';

describe('Quotation money contract with the decimal backend', () => {
  it('rounds each line, line discount, order discount and tax separately to two decimals', () => {
    expect(calculateQuotation([{ quantity: 2.5, unitPrice: 20000, discountPercent: 10 }], 5, 8))
      .toEqual({ subTotal: 45000, discountAmount: 2250, taxAmount: 3420, totalAmount: 46170 });
  });
  it('rounds a midpoint away from zero and avoids floating point accumulation', () => {
    expect(calculateQuotation([{ quantity: 1, unitPrice: 1.005 }, { quantity: 3, unitPrice: 0.1 }], 0, 0))
      .toEqual({ subTotal: 1.31, discountAmount: 0, taxAmount: 0, totalAmount: 1.31 });
  });
  it.each([0, 8, 10, 100])('supports VAT %s with 100 percent discount', (tax) => {
    expect(calculateQuotation([{ quantity: 1, unitPrice: 18000 }], 100, tax).totalAmount).toBe(0);
  });
  it('supports a free item and an empty draft without NaN', () => {
    expect(calculateQuotation([{ quantity: 1, unitPrice: 0 }], 0, 0).totalAmount).toBe(0);
    expect(calculateQuotation([], 0, 0).totalAmount).toBe(0);
  });
});
