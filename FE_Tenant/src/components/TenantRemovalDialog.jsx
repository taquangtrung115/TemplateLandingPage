import { useState } from "react";
import { PackageMinus, Trash2 } from "lucide-react";
import Field from "./Field";
import Modal from "./Modal";
import { getApplicationName } from "../applications";

export default function TenantRemovalDialog({ removal, busy, error, onClose, onConfirm }) {
  const { tenant, appKey } = removal;
  const [key, setKey] = useState("");
  const [purge, setPurge] = useState(false);
  const title = appKey ? "Gỡ cài đặt ứng dụng" : "Xóa công ty";
  return <Modal title={title} icon={appKey ? PackageMinus : Trash2} busy={busy} onClose={onClose}>
    <form className="form-stack" onSubmit={event => { event.preventDefault(); onConfirm(key, purge); }}>
      {appKey ? <p>Gỡ <strong>{getApplicationName(appKey)}</strong> khỏi <strong>{tenant.name}</strong>. Thành viên mất quyền truy cập ứng dụng này cho đến khi cài lại.</p>
        : <p>Xóa vĩnh viễn <strong>{tenant.name}</strong>, các ứng dụng và phân quyền của công ty khỏi OnePortal.</p>}
      <label className="setting-row">
        <input type="checkbox" checked={purge} onChange={event => setPurge(event.target.checked)} disabled={busy} />
        {appKey ? "Xóa luôn dữ liệu nghiệp vụ và thành viên của ứng dụng này" : "Xóa toàn bộ dữ liệu phát sinh"}
      </label>
      {!appKey && <Field label="Nhập lại mã workspace" value={key} required maxLength={63} autoComplete="off"
        hint={"Mã cần nhập " + tenant.key} onChange={event => setKey(event.target.value)} />}
      {error && <p className="portal-notice portal-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="button" className="portal-secondary" onClick={onClose} disabled={busy}>Hủy</button>
        <button type="submit" className="portal-danger" disabled={busy || (!appKey && key !== tenant.key)}>
          {appKey ? "Xác nhận gỡ cài đặt" : "Xác nhận xóa công ty"}
        </button>
      </div>
    </form>
  </Modal>;
}
