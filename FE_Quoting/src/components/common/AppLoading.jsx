import React from 'react';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Icon } from '@astryxdesign/core/Icon';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import './AppLoading.css';

export default function AppLoading({ label = 'Đang chuẩn bị không gian làm việc' }) {
  return <main className="app-loading" aria-busy="true">
    <div className="app-loading-content" role="status" aria-live="polite">
      <div className="app-loading-brand"><Icon icon={BuildingStorefrontIcon} size="lg" /><span>CHUỖI ĂN VẶT</span></div>
      <div className="app-loading-document" aria-hidden="true">
        <div className="app-loading-document-title" />
        <div className="app-loading-document-rule" />
        <div className="app-loading-document-line" />
        <div className="app-loading-document-line app-loading-line-short" />
        <div className="app-loading-document-table">{[0, 1, 2].map((index) => <div key={index} />)}</div>
        <div className="app-loading-document-signature" />
      </div>
      <h1>Hệ thống báo giá</h1>
      <p>{label}</p>
      <div className="app-loading-progress" aria-hidden="true"><Skeleton height={4} radius="rounded" /></div>
    </div>
  </main>;
}
