import React from 'react';
import { Badge } from '@astryxdesign/core/Badge';

export const QUOTATION_STATUS_LABELS = { Draft: 'Bản nháp', Sent: 'Đã gửi', Approved: 'Đã phê duyệt', Rejected: 'Đã từ chối', Cancelled: 'Đã hủy' };
const statusVariants = { Draft: 'neutral', Sent: 'warning', Approved: 'success', Rejected: 'error', Cancelled: 'neutral' };

export function QuotationStatusBadge({ status }) {
  const key = Object.keys(QUOTATION_STATUS_LABELS).find((key) => key.toLowerCase() === status?.trim().toLowerCase());
  return <Badge label={QUOTATION_STATUS_LABELS[key] || status || 'Không xác định'} variant={statusVariants[key] || 'neutral'} />;
}

export function ProductCategoryBadge({ category }) {
  return <Badge label={category || 'Chưa phân loại'} variant={category?.toUpperCase().includes('COMBO') ? 'blue' : 'neutral'} />;
}

export function UnitBadge({ unit }) {
  return <Badge label={unit || '—'} variant="neutral" />;
}
