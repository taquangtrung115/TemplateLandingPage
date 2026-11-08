import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QuotationStatusBadge, ProductCategoryBadge, UnitBadge } from '../src/components/common/StatusBadge';

describe('Astryx quotation badges', () => {
  it.each([['Draft', 'Bản nháp', 'neutral'], [' sent ', 'Đã gửi', 'warning'], ['Approved', 'Đã phê duyệt', 'success'], ['Rejected', 'Đã từ chối', 'error'], ['Cancelled', 'Đã hủy', 'neutral']])('labels %s consistently', (status, label, variant) => {
    render(<QuotationStatusBadge status={status} />);
    expect(screen.getByText(label).closest('[data-variant]')).toHaveAttribute('data-variant', variant);
  });
  it('keeps an unknown status visible', () => { render(<QuotationStatusBadge status="Imported" />); expect(screen.getByText('Imported')).toBeInTheDocument(); });
  it('handles missing labels without empty badges', () => { render(<><QuotationStatusBadge /><ProductCategoryBadge /><UnitBadge /></>); expect(screen.getByText('Không xác định')).toBeInTheDocument(); expect(screen.getByText('Chưa phân loại')).toBeInTheDocument(); expect(screen.getByText('—')).toBeInTheDocument(); });
  it('preserves a custom product group and unit', () => { render(<><ProductCategoryBadge category="Sản phẩm mới" /><UnitBadge unit="10 CUỘN/GÓI" /></>); expect(screen.getByText('Sản phẩm mới')).toBeInTheDocument(); expect(screen.getByText('10 CUỘN/GÓI')).toBeInTheDocument(); });
});
