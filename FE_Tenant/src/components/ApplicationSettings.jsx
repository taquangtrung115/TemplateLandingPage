import React, { useState } from "react";
import { Building2, CircleAlert, Database, LoaderCircle, LockKeyhole, LockKeyholeOpen, RotateCcw, Save, ShieldCheck, ToggleRight, UserPlus } from "lucide-react";
import Field from "./Field";
import { UiverseIconLabel as IconLabel } from "@oneportal/uiverse-ui";
export default function ApplicationSettings({
  tenant,
  appKey,
  application,
  busy,
  onConfigure,
  onUpdate,
  onChangeAccess,
  onUninstall,
  onDelete,
}) {
  const [enabled, setEnabled] = useState(application?.isEnabled || false),
    [registration, setRegistration] = useState(
      application?.allowSelfRegistration || false,
    ),
    [name, setName] = useState(tenant.name);
  return (
    <div className="form-stack">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onConfigure({
            isEnabled: enabled,
            allowSelfRegistration: registration,
          });
        }}
      >
        <h3 className="font-semibold"><IconLabel icon={ShieldCheck}>Truy cập ứng dụng</IconLabel></h3>
        <label className="setting-row">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          <div>
            <strong><IconLabel icon={ToggleRight}>Bật ứng dụng</IconLabel></strong>
            <p>
              Cho phép thành viên truy cập. Dữ liệu nền tảng được khởi tạo tự
              động khi bật.
            </p>
          </div>
        </label>
        <label className="setting-row">
          <input
            type="checkbox"
            checked={registration}
            onChange={(event) => setRegistration(event.target.checked)}
            disabled={!enabled}
          />
          <div>
            <strong><IconLabel icon={UserPlus}>Cho phép tự đăng ký</IconLabel></strong>
            <p>
              Người đăng ký từ đường dẫn của công ty được dùng ngay với vai trò
              User.
            </p>
          </div>
        </label>
        <button className="portal-button mt-4" disabled={busy} aria-busy={busy || undefined}>
          <span className={busy ? "portal-pending" : undefined}><IconLabel icon={busy ? LoaderCircle : Save}>{busy ? "Đang lưu…" : "Lưu cấu hình"}</IconLabel></span>
        </button>
      </form>
      <details className="technical-details">
        <summary><IconLabel icon={Database}>Thông tin khởi tạo dữ liệu</IconLabel></summary>
        <div className="details-content">
          <p>
            Ứng dụng: {appKey} · Phiên bản dữ liệu:{" "}
            {application?.seedVersion || 0}
          </p>
          {application?.lastInitializationError && (
            <p role="alert"><IconLabel icon={CircleAlert}>{application.lastInitializationError}</IconLabel></p>
          )}
          <button
            className="portal-secondary"
            disabled={busy || !application?.isEnabled}
            onClick={() =>
              onConfigure({
                isEnabled: true,
                allowSelfRegistration: application.allowSelfRegistration,
              })
            }
          >
            <IconLabel icon={RotateCcw}>Chạy lại khởi tạo</IconLabel>
          </button>
        </div>
      </details>
      <div className="tenant-lock">
        <h3 className="font-semibold mb-4"><IconLabel icon={Building2}>Thông tin công ty</IconLabel></h3>
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            onUpdate({ name, isActive: tenant.isActive });
          }}
        >
          <Field
            label="Tên công ty"
            icon={Building2}
            value={name}
            maxLength={200}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <div>
            <button className="portal-secondary" disabled={busy}>
              <IconLabel icon={Save}>Lưu tên công ty</IconLabel>
            </button>
          </div>
        </form>
        <p className="muted mt-5 mb-3">
          {tenant.isActive
            ? "Khóa công ty sẽ chặn truy cập tất cả ứng dụng của công ty."
            : "Công ty đang bị khóa truy cập."}
        </p>
        <button type="button" className="portal-secondary" disabled={busy} onClick={onChangeAccess}>
          <IconLabel icon={tenant.isActive ? LockKeyhole : LockKeyholeOpen}>{tenant.isActive ? "Khóa công ty" : "Mở công ty"}</IconLabel>
        </button>
      </div>
      <section className="tenant-lock">
        <h3 className="font-semibold mb-2">Vùng nguy hiểm</h3>
        <div className="workspace-actions">
          {onUninstall && <button type="button" className="portal-secondary danger-text" onClick={onUninstall} disabled={busy}>Gỡ cài đặt</button>}
          <button type="button" className="portal-danger" onClick={onDelete} disabled={busy}>Xóa công ty</button>
        </div>
      </section>
    </div>
  );
}
