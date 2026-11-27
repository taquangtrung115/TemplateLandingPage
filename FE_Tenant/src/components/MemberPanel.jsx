import React, { useEffect, useState } from "react";
import {
  CircleAlert, CircleCheck, KeyRound, LoaderCircle, LockKeyhole, LockKeyholeOpen,
  Mail, ShieldCheck, UserPlus, UserRound, UserRoundCheck, Users, X,
} from "lucide-react";
import { UiverseButton, UiverseIconLabel as IconLabel } from "@oneportal/uiverse-ui";
import { tenantApi } from "../api/tenantApi";
import Field from "./Field";
import Modal from "./Modal";
import Pagination from "./Pagination";
import { getApplicationName } from "../applications";

export default function MemberPanel({ tenant, appKey }) {
  // #region State and effects
  const [members, setMembers] = useState([]),
    [page, setPage] = useState(1),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [adding, setAdding] = useState(false),
    [mode, setMode] = useState("new");
  const [revision, setRevision] = useState(0);
  const appName = getApplicationName(appKey);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    tenantApi
      .members(tenant.id, appKey, page, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setMembers(result.items);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [tenant.id, appKey, page, revision]);
  // #endregion
  // #region Handlers
  async function save(value, create = false) {
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (create) await tenantApi.createMember(tenant.id, appKey, value);
      else await tenantApi.setMember(tenant.id, appKey, value);
      setAdding(false);
      setNotice(
        create
          ? "Đã tạo tài khoản và cấp quyền " + appName + "."
          : "Đã cập nhật quyền truy cập.",
      );
      setRevision((value) => value + 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }
  function addMember(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    save(
      {
        email: data.get("email"),
        role: data.get("role"),
        ...(mode === "new"
          ? { fullName: data.get("fullName"), password: data.get("password") }
          : { isActive: true }),
      },
      mode === "new",
    );
  }
  // #endregion
  return (
    <section aria-label={"Thành viên " + appName}>
      <div className="panel-heading">
        <div>
          <h3 className="font-semibold"><IconLabel icon={Users}>Người dùng ứng dụng</IconLabel></h3>
          <p className="muted mt-1">
            Quyền chỉ áp dụng cho {appName} tại công ty này.
          </p>
        </div>
        <button
          className="portal-button"
          onClick={() => {
            setAdding(true);
            setError("");
            setMode("new");
          }}
        >
          <IconLabel icon={UserPlus}>Thêm người dùng</IconLabel>
        </button>
      </div>
      {error && !adding && (
        <p role="alert" className="portal-notice portal-error">
          <IconLabel icon={CircleAlert}>{error}</IconLabel>
        </p>
      )}
      {notice && (
        <p role="status" className="portal-notice">
          <IconLabel icon={CircleCheck}>{notice}</IconLabel>
        </p>
      )}
      {loading && (
        <p role="status" className="muted portal-pending">
          <IconLabel icon={LoaderCircle}>Đang tải thành viên…</IconLabel>
        </p>
      )}
      <ul className="member-list" aria-busy={loading}>
        {members.map((member) => (
          <li key={member.id} className="member-row">
            <div>
              <strong>{member.fullName}</strong>
              <small>{member.email}</small>
            </div>
            <div className="member-role">
              <ShieldCheck className="tenant-icon" aria-hidden="true" />
              <select
                className="portal-field"
                aria-label={"Vai trò của " + member.email}
                value={member.role}
                disabled={saving || loading}
                onChange={(event) =>
                  save({
                    email: member.email,
                    role: event.target.value,
                    isActive: member.isActive,
                  })
                }
              >
                <option value="User">Người dùng</option>
                <option value="Admin">Quản trị viên</option>
              </select>
            </div>
            <span
              className={
                "status " +
                (member.isActive && member.accountIsActive ? "ready" : "")
              }
            >
              <IconLabel icon={member.isActive && member.accountIsActive ? CircleCheck : LockKeyhole}>{!member.accountIsActive
                ? "Tài khoản khóa"
                : member.isActive
                  ? "Hoạt động"
                  : "Đã khóa quyền"}</IconLabel>
            </span>
            <button
              className="portal-secondary"
              disabled={saving || loading || !member.accountIsActive}
              onClick={() =>
                save({
                  email: member.email,
                  role: member.role,
                  isActive: !member.isActive,
                })
              }
            >
              <IconLabel icon={member.isActive ? LockKeyhole : LockKeyholeOpen}>{member.isActive ? "Khóa quyền" : "Mở quyền"}</IconLabel>
            </button>
          </li>
        ))}
      </ul>
      {!members.length && !loading && !error && (
        <div className="empty-state">
          <h3>Chưa có người dùng</h3>
          <p>Thêm tài khoản mới hoặc cấp quyền cho tài khoản đã có.</p>
        </div>
      )}
      <Pagination page={page} canGoNext={members.length >= 20} busy={saving || loading} onChange={setPage} />
      {adding && (
        <Modal
          title="Thêm người dùng"
          icon={UserPlus}
          onClose={() => setAdding(false)}
          busy={saving}
        >
          <form className="form-stack" onSubmit={addMember}>
            <p className="context-note">
              <strong>{tenant.name}</strong> / {appName}
              <br />
              Tài khoản dùng chung; quyền được cấp riêng cho ứng dụng này.
            </p>
            <div className="mode-choices">
              <button
                type="button"
                className="portal-secondary"
                aria-pressed={mode === "new"}
                disabled={saving}
                onClick={() => setMode("new")}
              >
                <IconLabel icon={UserPlus}>Tạo tài khoản mới</IconLabel>
              </button>
              <button
                type="button"
                className="portal-secondary"
                aria-pressed={mode === "existing"}
                disabled={saving}
                onClick={() => setMode("existing")}
              >
                <IconLabel icon={UserRoundCheck}>Tài khoản đã có</IconLabel>
              </button>
            </div>
            {error && (
              <p role="alert" className="portal-notice portal-error">
                <IconLabel icon={CircleAlert}>{error}</IconLabel>
              </p>
            )}
            {mode === "new" && (
              <Field
                label="Họ tên"
                icon={UserRound}
                className="portal-field uv-view-enter"
                name="fullName"
                maxLength={100}
                autoComplete="name"
                required
              />
            )}
            <Field
              label="Email"
              icon={Mail}
              name="email"
              type="email"
              maxLength={256}
              autoComplete="off"
              required
            />
            {mode === "new" && (
              <Field
                label="Mật khẩu ban đầu"
                icon={KeyRound}
                className="portal-field uv-view-enter"
                name="password"
                type="password"
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                hint="Từ 8 ký tự. Gửi thông tin đăng nhập qua kênh riêng của công ty."
                required
              />
            )}
            <label className="field-label">
              <IconLabel icon={ShieldCheck}>Vai trò</IconLabel>
              <select className="portal-field" name="role" defaultValue="User">
                <option value="User">Người dùng — sử dụng nghiệp vụ</option>
                <option value="Admin">Quản trị viên — quản lý ứng dụng</option>
              </select>
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="portal-secondary"
                disabled={saving}
                onClick={() => setAdding(false)}
              >
                <IconLabel icon={X}>Hủy</IconLabel>
              </button>
              <UiverseButton type="submit" isLoading={saving} icon={<ShieldCheck className="tenant-icon" aria-hidden="true" />}>
                {saving
                  ? "Đang lưu…"
                  : mode === "new"
                    ? "Tạo & cấp quyền"
                    : "Cấp quyền"}
              </UiverseButton>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
