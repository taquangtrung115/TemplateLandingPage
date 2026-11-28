import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import Modal from "./Modal";

export default function TenantAccessDialog({ tenant, busy, error, onClose, onConfirm }) {
  return <Modal title={tenant.isActive ? "Khóa công ty" : "Mở công ty"} icon={tenant.isActive ? LockKeyhole : LockKeyholeOpen} busy={busy} onClose={onClose}>
    <p><strong>{tenant.name}</strong></p>
    <p className="muted mt-2">{tenant.isActive ? "Khóa công ty sẽ chặn truy cập tất cả ứng dụng của công ty." : "Mở lại quyền truy cập các ứng dụng đang bật của công ty."}</p>
    {error && <p role="alert" className="portal-notice portal-error mt-3">{error}</p>}
    <div className="form-actions mt-5">
      <button type="button" className="portal-secondary" disabled={busy} onClick={onClose}>Hủy</button>
      <button type="button" className="portal-button" disabled={busy} onClick={onConfirm}>{tenant.isActive ? "Xác nhận khóa" : "Xác nhận mở"}</button>
    </div>
  </Modal>;
}
