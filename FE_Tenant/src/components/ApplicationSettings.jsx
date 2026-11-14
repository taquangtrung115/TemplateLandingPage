import React, { useState } from 'react';
import Field from './Field';
export default function ApplicationSettings({ tenant, appKey, application, busy, onConfigure, onUpdate }) {
  const [enabled, setEnabled] = useState(application?.isEnabled || false), [registration, setRegistration] = useState(application?.allowSelfRegistration || false), [name, setName] = useState(tenant.name), [confirmLock, setConfirmLock] = useState(false);
  return <div className="form-stack">
    <form onSubmit={event => { event.preventDefault(); onConfigure({ isEnabled: enabled, allowSelfRegistration: registration }); }}>
      <h3 className="font-semibold">Truy cập ứng dụng</h3>
      <label className="setting-row"><input type="checkbox" checked={enabled} onChange={event => setEnabled(event.target.checked)}/><div><strong>Bật ứng dụng</strong><p>Cho phép thành viên truy cập. Dữ liệu nền tảng được khởi tạo tự động khi bật.</p></div></label>
      <label className="setting-row"><input type="checkbox" checked={registration} onChange={event => setRegistration(event.target.checked)} disabled={!enabled}/><div><strong>Cho phép tự đăng ký</strong><p>Người đăng ký từ đường dẫn của công ty được dùng ngay với vai trò User.</p></div></label>
      <button className="portal-button mt-4" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu cấu hình'}</button>
    </form>
    <details className="technical-details"><summary>Thông tin khởi tạo dữ liệu</summary><p>Ứng dụng: {appKey} · Phiên bản dữ liệu: {application?.seedVersion || 0}</p>
      {application?.lastInitializationError && <p role="alert">{application.lastInitializationError}</p>}
      <button className="portal-secondary" disabled={busy || !application?.isEnabled} onClick={() => onConfigure({ isEnabled: true, allowSelfRegistration: application.allowSelfRegistration })}>Chạy lại khởi tạo</button></details>
    <div className="tenant-lock"><h3 className="font-semibold mb-4">Thông tin công ty</h3><form className="form-stack" onSubmit={event => { event.preventDefault(); onUpdate({ name, isActive: tenant.isActive }); }}><Field label="Tên công ty" value={name} maxLength={200} onChange={event => setName(event.target.value)} required/><div><button className="portal-secondary" disabled={busy}>Lưu tên công ty</button></div></form>
      <p className="muted mt-5 mb-3">{tenant.isActive ? 'Khóa công ty sẽ chặn truy cập tất cả ứng dụng của công ty.' : 'Công ty đang bị khóa truy cập.'}</p>
      {confirmLock ? <div className="form-actions"><button className="portal-secondary" disabled={busy} onClick={() => setConfirmLock(false)}>Hủy</button><button className="portal-secondary" disabled={busy} onClick={() => onUpdate({ name: tenant.name, isActive: !tenant.isActive })}>Xác nhận {tenant.isActive ? 'khóa' : 'mở'}</button></div> : <button className="portal-secondary" disabled={busy} onClick={() => setConfirmLock(true)}>{tenant.isActive ? 'Khóa công ty' : 'Mở công ty'}</button>}
    </div>
  </div>;
}
