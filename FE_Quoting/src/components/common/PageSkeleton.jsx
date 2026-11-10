import React from 'react';
import { Skeleton } from '@astryxdesign/core/Skeleton';

export default function PageSkeleton() {
  return <div className="quoting-page-stack" role="status" aria-label="Đang tải trang" aria-busy="true">
    <Skeleton width="45%" height={36} />
    <Skeleton width="65%" height={20} index={1} />
    <div className="page-skeleton-metrics">{[0, 1, 2].map((index) => <Skeleton key={index} height={100} index={index + 2} />)}</div>
    <Skeleton height={280} index={5} />
    <span className="visually-hidden">Đang tải nội dung, vui lòng chờ.</span>
  </div>;
}
