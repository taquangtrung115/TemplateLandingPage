import React from 'react';
import { Table } from '@astryxdesign/core/Table';
export { pixel, proportional } from '@astryxdesign/core/Table';

export function QuotingTable({ label = 'Bảng dữ liệu, cuộn ngang để xem thêm cột', ...props }) {
  return <Table aria-label={label} {...props} />;
}
