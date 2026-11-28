import { useEffect, useRef, useState } from "react";
import { CircleAlert, LoaderCircle, ShieldCheck, UserPlus, Users } from "lucide-react";
import { UiverseButton, UiverseIconLabel as IconLabel } from "@oneportal/uiverse-ui";
import { tenantApi } from "../api/tenantApi";
import Field from "./Field";
import Modal from "./Modal";
import Pagination from "./Pagination";
import { applications, getApplicationName } from "../applications";

const workspace = "workspace";
const roles = { User: "Người dùng", Admin: "Quản trị viên" };

function MemberForm({ tenant, initialAppKey, readyApps, busy, error, onClose, onSave }) {
  const [mode, setMode] = useState("new");
  const [scope, setScope] = useState(readyApps.some(app => app.appKey === initialAppKey) ? initialAppKey : readyApps[0]?.appKey || workspace);

  function submit(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const email = fields.get("email").trim();
    const role = fields.get("role");
    const profile = { fullName: fields.get("fullName"), password: fields.get("password") };
    if (scope === workspace) {
      onSave(() => tenantApi.setWorkspaceMember(tenant.id, {
        email, role, ...(mode === "new" && { fullName: profile.fullName, newPassword: profile.password }),
      }));
    } else {
      onSave(mode === "new"
        ? () => tenantApi.createMember(tenant.id, scope, { ...profile, email, role })
        : () => tenantApi.setMember(tenant.id, scope, { email, role, isActive: true }));
    }
  }

  return <Modal title="Thêm người dùng" icon={UserPlus} busy={busy} onClose={onClose}>
    <form className="form-stack" onSubmit={submit}>
      <p className="context-note"><strong>{tenant.name}</strong></p>
      <div className="mode-choices">
        <button type="button" className="portal-secondary" aria-pressed={mode === "new"} onClick={() => setMode("new")} disabled={busy}>Tạo tài khoản mới</button>
        <button type="button" className="portal-secondary" aria-pressed={mode === "existing"} onClick={() => setMode("existing")} disabled={busy}>Tài khoản đã có</button>
      </div>
      {error && <p role="alert" className="portal-notice portal-error">{error}</p>}
      {mode === "new" && <Field label="Họ tên" name="fullName" maxLength={100} required />}
      <Field label="Email" name="email" type="email" required maxLength={256} />
      {mode === "new" && <Field label="Mật khẩu ban đầu" name="password" type="password" minLength={8} maxLength={128} required autoComplete="new-password" />}
      <label className="field-label">Phạm vi cấp quyền<select className="portal-field" value={scope} onChange={event => setScope(event.target.value)}>
        <option value={workspace}>Toàn công ty · mọi ứng dụng đang bật</option>
        {readyApps.map(app => <option key={app.appKey} value={app.appKey}>{getApplicationName(app.appKey)}</option>)}
      </select></label>
      <label className="field-label">Vai trò<select className="portal-field" name="role" defaultValue="User">
        {Object.entries(roles).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select></label>
      <div className="form-actions">
        <button type="button" className="portal-secondary" disabled={busy} onClick={onClose}>Hủy</button>
        <UiverseButton type="submit" isLoading={busy}>{mode === "new" ? "Tạo & cấp quyền" : "Cấp quyền"}</UiverseButton>
      </div>
    </form>
  </Modal>;
}

function MemberActionDialog({ dialog, tenant, busy, error, onClose, onRun }) {
  const { member, appKey, type } = dialog;
  const title = type === "profile" ? "Sửa người dùng" : appKey ? "Gỡ quyền ứng dụng" : "Gỡ quyền toàn công ty";
  function submit(event) {
    event.preventDefault();
    if (type === "profile") {
      const fields = new FormData(event.currentTarget);
      onRun(() => tenantApi.updateMemberProfile(tenant.id, member.id, {
        fullName: fields.get("fullName").trim(), newPassword: fields.get("newPassword") || null,
      }), "Đã cập nhật tài khoản.");
    } else if (appKey) {
      onRun(() => tenantApi.removeMember(tenant.id, appKey, member.id), "Đã gỡ quyền riêng của ứng dụng.");
    } else {
      onRun(() => tenantApi.setWorkspaceMember(tenant.id, { email: member.email, role: null }), "Đã gỡ quyền toàn công ty.");
    }
  }
  return <Modal title={title} onClose={onClose} busy={busy}>
    <form className="form-stack" onSubmit={submit}>
      <p className="context-note">{member.email}</p>
      {type === "profile" ? <>
        <p className="muted">Tên hiển thị và mật khẩu áp dụng cho tài khoản OnePortal này ở mọi công ty.</p>
        <Field label="Họ tên" name="fullName" maxLength={100} defaultValue={member.fullName} required />
        <Field label="Đặt lại mật khẩu mới" name="newPassword" type="password" minLength={8} maxLength={128} autoComplete="new-password"
          hint="Để trống nếu chỉ sửa tên hiển thị." />
      </> : <p className="muted">{appKey
        ? member.workspaceRole ? "Ứng dụng sẽ dùng vai trò được cấp từ công ty." : "Người dùng sẽ mất quyền truy cập ứng dụng này."
        : "Quyền đã cấp riêng trên từng ứng dụng vẫn có hiệu lực."}</p>}
      {error && <p role="alert" className="portal-notice portal-error">{error}</p>}
      <div className="form-actions">
        <button type="button" className="portal-secondary" disabled={busy} onClick={onClose}>Hủy</button>
        <UiverseButton type="submit" isLoading={busy}>{type === "profile" ? "Lưu hồ sơ" : "Xác nhận gỡ quyền"}</UiverseButton>
      </div>
    </form>
  </Modal>;
}

export default function MemberPanel({ tenant, appKey, onChanged }) {
  // #region State and effects
  const [users, setUsers] = useState({ items: [], totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState(null);
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const active = useRef(true);
  const pending = useRef(false);
  const readyApps = tenant.applications.filter(app => app.isEnabled && app.provisioningStatus === "Ready");

  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => {
    const timeout = setTimeout(() => { setKeyword(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(timeout);
  }, [search]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setRequestError("");
    tenantApi.users(tenant.id, page, keyword, controller.signal).then(result => {
      if (controller.signal.aborted) return;
      if (page > 1 && result.items.length === 0) { setPage(page - 1); return; }
      setUsers(result);
    }).catch(failure => {
      if (!controller.signal.aborted) setRequestError(failure.message);
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [tenant.id, page, keyword, revision]);
  // #endregion

  // #region Handlers
  function open(value) { setError(""); setDialog(value); }

  async function run(action, message) {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await action();
      if (!active.current) return;
      setNotice(message);
      setDialog(null);
      setRevision(value => value + 1);
      onChanged?.();
    } catch (failure) {
      if (active.current) setError(failure.message);
    } finally {
      pending.current = false;
      if (active.current) setSaving(false);
    }
  }

  function changeWorkspace(member, role) {
    if (!role) open({ type: "remove", member });
    else run(() => tenantApi.setWorkspaceMember(tenant.id, { email: member.email, role }), "Đã cập nhật quyền toàn công ty.");
  }

  function changeApp(member, app, direct, value) {
    if (value === "inherit") open({ type: "remove", member, appKey: app.key });
    else run(() => tenantApi.setMember(tenant.id, app.key, {
      email: member.email, role: value === "blocked" ? direct?.role || member.workspaceRole || "User" : value, isActive: value !== "blocked",
    }), "Đã cập nhật quyền " + app.name + ".");
  }
  // #endregion

  return <section aria-label="Quyền người dùng theo công ty và ứng dụng">
    <div className="panel-heading">
      <div><h3 className="font-semibold"><IconLabel icon={Users}>Ma trận quyền người dùng</IconLabel></h3>
        <p className="muted mt-1">Quyền toàn công ty áp dụng cho các app đang bật. Thiết lập riêng trên app được ưu tiên.</p></div>
      <button type="button" className="portal-button" disabled={saving || !tenant.isActive} onClick={() => open({ type: "add" })}><IconLabel icon={UserPlus}>Thêm người dùng</IconLabel></button>
    </div>
    <Field label="Tìm người dùng" type="search" value={search} maxLength={160} onChange={event => setSearch(event.target.value)} placeholder="Tên hoặc email" />
    {notice && <p role="status" className="portal-notice mt-3">{notice}</p>}
    {(requestError || (error && !dialog)) && <p role="alert" className="portal-notice portal-error mt-3"><IconLabel icon={CircleAlert}>{requestError || error}</IconLabel></p>}
    {loading && <p role="status" className="muted portal-pending mt-3"><IconLabel icon={LoaderCircle}>Đang tải thành viên…</IconLabel></p>}
    {users.items.length > 0 && <div className="user-matrix-wrap" aria-busy={loading}>
      <table className="user-matrix">
        <thead><tr><th scope="col">Tài khoản</th><th scope="col">Toàn công ty</th>
          {applications.map(app => <th key={app.key} scope="col">{app.name}</th>)}<th scope="col">Hồ sơ</th></tr></thead>
        <tbody>{users.items.map(member => <tr key={member.id}>
          <th scope="row"><strong>{member.fullName}</strong><small>{member.email}</small>{!member.accountIsActive && <small className="danger-text">Tài khoản đã khóa</small>}</th>
          <td data-label="Toàn công ty"><select aria-label={"Quyền công ty của " + member.email}
            className="portal-field" value={member.workspaceRole || ""} disabled={saving || !tenant.isActive}
            onChange={event => changeWorkspace(member, event.target.value)}>
            <option value="">Theo từng app</option>
            {Object.entries(roles).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select></td>
          {applications.map(app => {
            const direct = member.applications.find(item => item.appKey === app.key);
            const enabled = readyApps.some(item => item.appKey === app.key);
            const value = direct ? direct.isActive ? direct.role : "blocked" : "inherit";
            return <td data-label={app.name} key={app.key}>
              <select aria-label={app.name + " của " + member.email} className="portal-field" value={value}
                disabled={saving || !tenant.isActive || !enabled} onChange={event => changeApp(member, app, direct, event.target.value)}>
                <option value="inherit">{member.workspaceRole ? "Kế thừa · " + roles[member.workspaceRole] : "Chưa cấp quyền"}</option>
                {Object.entries(roles).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                <option value="blocked">Chặn truy cập</option>
              </select>
              <small>{enabled ? direct ? "Quyền riêng của app" : member.workspaceRole ? "Từ công ty" : "Chưa cấp" : "App chưa sẵn sàng"}</small>
              {direct && <button type="button" className="matrix-remove" disabled={saving} aria-label={"Gỡ quyền " + app.name + " của " + member.email}
                onClick={() => open({ type: "remove", member, appKey: app.key })}>{member.workspaceRole ? "Dùng quyền công ty" : "Gỡ khỏi app"}</button>}
            </td>;
          })}
          <td data-label="Hồ sơ"><button type="button" className="portal-secondary" onClick={() => open({ type: "profile", member })} disabled={saving}>Sửa</button></td>
        </tr>)}</tbody>
      </table>
    </div>}
    {!loading && !requestError && !users.items.length && <div className="empty-state"><h3>{keyword ? "Không tìm thấy người dùng" : "Chưa có người dùng"}</h3>
      <p>Thêm tài khoản mới hoặc cấp quyền cho tài khoản đã có.</p></div>}
    {(page > 1 || page * users.pageSize < users.totalCount) && <Pagination page={page} canGoNext={page * users.pageSize < users.totalCount}
      busy={saving || loading} onChange={setPage} />}
    {dialog?.type === "add" && <MemberForm tenant={tenant} initialAppKey={appKey} readyApps={readyApps} busy={saving} error={error}
      onClose={() => open(null)} onSave={action => run(action, "Đã cấp quyền cho người dùng.")} />}
    {dialog && dialog.type !== "add" && <MemberActionDialog dialog={dialog} tenant={tenant} busy={saving} error={error} onClose={() => open(null)} onRun={run} />}
  </section>;
}
