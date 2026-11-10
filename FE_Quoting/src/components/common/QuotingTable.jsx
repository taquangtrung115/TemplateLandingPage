import React from 'react';
import { Table } from '@astryxdesign/core/Table';
import { pixel } from '@astryxdesign/core/Table';
import { useMediaQuery } from '@astryxdesign/core/hooks';
export { pixel, proportional } from '@astryxdesign/core/Table';

// Mobile records have their own reading order and controls, without a table viewport.
export function MobileRecordList({ data, columns, idKey = 'id', label = 'Danh sách trên điện thoại' }) {
  const contentColumns = columns.filter((column) => column.key !== 'actions');
  const actionColumn = columns.find((column) => column.key === 'actions');
  return <div className="mobile-record-list" aria-label={label}>
    {data.map((row) => <article key={row[idKey]} className="mobile-record">
      <div className="mobile-record-heading">
        <div>{contentColumns[0]?.renderCell?.(row) ?? row[contentColumns[0]?.key]}</div>
      </div>
      <dl>{contentColumns.slice(1).map((column) => <div className="mobile-record-field" key={column.key}>
        <dt>{column.header}</dt><dd>{column.renderCell?.(row) ?? row[column.key]}</dd>
      </div>)}</dl>
      {actionColumn && <div className="mobile-record-actions">{actionColumn.renderCell(row)}</div>}
    </article>)}
  </div>;
}

export function QuotingTable({ label = 'Bảng dữ liệu, cuộn ngang để xem thêm cột', plugins = {}, ...props }) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const hasActions = props.columns?.at(-1)?.key === 'actions';
  if (isMobile) return <MobileRecordList {...props} label="Danh sách trên điện thoại" />;
  return <div className={hasActions ? 'quoting-desktop-table has-sticky-actions' : 'quoting-desktop-table'}>
    <Table aria-label={label} plugins={plugins} {...props}
      columns={props.columns?.map((column) => column.key === 'actions' ? { ...column, width: pixel(144) } : column)} />
  </div>;
}
