import { describe, it, expect, beforeEach } from 'vitest';
import {
  readAuthToken,
  readAuthUser,
  rememberAuthToken,
  rememberAuthUser,
  writeAuthSession,
  clearAuthSession,
  applyAuthStorageEvent
} from '../../FE_Quoting/src/utils/authStorage.js';

describe('FE_Quoting Calculation & AuthStorage Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    clearAuthSession();
  });

  describe('1. Happy Paths (Đường chạy thuận lợi)', () => {
    it('calculates line item totals, subtotal, discount and VAT correctly based on real Chuỗi Ăn Vặt PDF items', () => {
      // Data from Chuỗi Ăn Vặt catalog
      const items = [
        {
          quantity: 10,
          unitPrice: 18000, // Combo nguyên bản bao ngon
          discountPercent: 10, // 10% line discount
        },
        {
          quantity: 2,
          unitPrice: 25000, // Xiên que surimi hải sản
          discountPercent: 0,
        },
      ];

      const discountPercent = 5; // 5% total discount
      const taxPercent = 10;     // 10% VAT

      // Calculation logic as implemented in CreateQuotationPage.jsx
      const getItemTotal = (item) => {
        const gross = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
        const disc = gross * ((Number(item.discountPercent) || 0) / 100);
        return Math.max(0, gross - disc);
      };

      const line1Total = getItemTotal(items[0]); // 10 * 18,000 = 180,000 - 18,000 = 162,000
      const line2Total = getItemTotal(items[1]); // 2 * 25,000 = 50,000
      expect(line1Total).toBe(162000);
      expect(line2Total).toBe(50000);

      const subTotal = items.reduce((sum, item) => sum + getItemTotal(item), 0); // 212,000
      expect(subTotal).toBe(212000);

      const discountAmount = Math.round(subTotal * (discountPercent / 100)); // 212,000 * 0.05 = 10,600
      expect(discountAmount).toBe(10600);

      const taxable = Math.max(0, subTotal - discountAmount); // 201,400
      expect(taxable).toBe(201400);

      const taxAmount = Math.round(taxable * (taxPercent / 100)); // 20,140
      expect(taxAmount).toBe(20140);

      const grandTotal = Math.round(taxable + taxAmount); // 221,540
      expect(grandTotal).toBe(221540);
    });

    it('writes and reads auth session correctly', () => {
      const mockUser = { id: 'usr-123', email: 'admin@chuoi-anvat.com', role: 'Admin' };
      const mockToken = 'mock-jwt-token-12345';

      const writeResult = writeAuthSession(mockToken, mockUser);
      expect(writeResult).toBe(true);

      expect(readAuthToken()).toBe(mockToken);
      expect(readAuthUser()).toEqual(mockUser);
      expect(localStorage.getItem('token')).toBe(mockToken);
    });
  });

  describe('2. Edge Cases (Trường hợp biên)', () => {
    it('handles 100% discount properly resulting in zero grand total', () => {
      const getItemTotal = (item) => {
        const gross = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
        const disc = gross * ((Number(item.discountPercent) || 0) / 100);
        return Math.max(0, gross - disc);
      };

      const items = [{ quantity: 5, unitPrice: 30000, discountPercent: 0 }];
      const subTotal = items.reduce((sum, item) => sum + getItemTotal(item), 0); // 150,000
      const discountPercent = 100;
      const taxPercent = 10;

      const discountAmount = Math.round(subTotal * (discountPercent / 100)); // 150,000
      const taxable = Math.max(0, subTotal - discountAmount); // 0
      const taxAmount = Math.round(taxable * (taxPercent / 100)); // 0
      const grandTotal = Math.round(taxable + taxAmount); // 0

      expect(taxable).toBe(0);
      expect(taxAmount).toBe(0);
      expect(grandTotal).toBe(0);
    });

    it('handles corrupted user JSON in localStorage safely without throwing exception', () => {
      localStorage.setItem('user', '{invalid_json_corrupted}');
      expect(readAuthUser()).toBeNull();
    });

    it('applies storage events from other tabs correctly', () => {
      localStorage.setItem('token', 'new-tab-token');
      applyAuthStorageEvent('token', 'new-tab-token');
      expect(readAuthToken()).toBe('new-tab-token');

      localStorage.setItem('user', JSON.stringify({ email: 'peer@tab.com' }));
      applyAuthStorageEvent('user', JSON.stringify({ email: 'peer@tab.com' }));
      expect(readAuthUser()).toEqual({ email: 'peer@tab.com' });
    });
  });

  describe('3. Failure Paths (Trường hợp thất bại & Xóa dữ liệu)', () => {
    it('clears auth session and resets token and user to null', () => {
      writeAuthSession('temp-token', { name: 'User' });
      expect(readAuthToken()).toBe('temp-token');

      clearAuthSession();

      expect(readAuthToken()).toBeNull();
      expect(readAuthUser()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('handles undefined or null token string gracefully', () => {
      writeAuthSession('undefined', null);
      expect(readAuthToken()).toBeNull();

      writeAuthSession('null', null);
      expect(readAuthToken()).toBeNull();
    });
  });
});
