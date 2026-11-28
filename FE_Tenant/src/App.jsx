import React, { useEffect, useRef, useState } from "react";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import {
  Building2, CircleAlert, CircleCheck, CircleMinus, Fingerprint, KeyRound,
  LoaderCircle, LockKeyhole, LockKeyholeOpen, LogIn, Mail, Plus, Settings,
  Store, UserCog, X,
} from "lucide-react";
import { tenantApi } from "./api/tenantApi";
import Field from "./components/Field";
import MemberPanel from "./components/MemberPanel";
import Modal from "./components/Modal";
import ApplicationSettings from "./components/ApplicationSettings";
import AppStore from "./components/AppStore";
import { UiverseButton, UiverseIconLabel as IconLabel } from "@oneportal/uiverse-ui";
import CommandRail from "./components/CommandRail";
import TenantSwitcher from "./components/TenantSwitcher";
import TenantAccessDialog from "./components/TenantAccessDialog";
import TenantRemovalDialog from "./components/TenantRemovalDialog";
import PortalHeader from "./components/PortalHeader";
import { applications, getApplicationName } from "./applications";
import { paths, tenantPath } from "./routes/paths";

function spotlight(event) {
  if (event.pointerType === "touch" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", (event.clientX - box.left) + "px");
  event.currentTarget.style.setProperty("--my", (event.clientY - box.top) + "px");
}

export default function App() {
  // #region State and effects
  const location = useLocation();
  const route = useMatch(paths.tenants + "/:tenantKey/:view");
  const navigate = useNavigate();
  const routeKey = route?.params.tenantKey;
  const section = { apps: "store", members: "members", settings: "settings" }[route?.params.view]
    || (location.pathname === paths.tenants ? "tenants" : "overview");
  const requestedApp = new URLSearchParams(location.search).get("app");
  const [user, setUser] = useState(null),
    [checking, setChecking] = useState(true),
    [busy, setBusy] = useState(false),
    [listing, setListing] = useState(false);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [tenants, setTenants] = useState([]),
    [page, setPage] = useState(1);
  const [lastSelected, setSelected] = useState(null),
    [chosenAppKey, setAppKey] = useState(null),
    [revision, setRevision] = useState(0);
  const [creating, setCreating] = useState(false),
    [changingAccess, setChangingAccess] = useState(false),
    [removal, setRemoval] = useState(null),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState("");
  const searchInput = useRef(null);
  const selected = routeKey
    ? (lastSelected?.key === routeKey ? lastSelected : tenants.find(tenant => tenant.key === routeKey))
    : lastSelected;
  const appKey =
    applications.find(app => app.key === requestedApp)?.key ||
    chosenAppKey ||
    selected?.applications.find(
      (app) => app.appKey === "quoting" && app.isEnabled,
    )?.appKey ||
    selected?.applications.find((app) => app.isEnabled)?.appKey ||
    "quoting";
  useEffect(() => {
    const controller = new AbortController();
    if (!localStorage.getItem("oneportal.tenant.token")) {
      setChecking(false);
      return;
    }
    tenantApi
      .me(controller.signal)
      .then((profile) => {
        if (!controller.signal.aborted) {
          if (!profile.isPlatformAdmin)
            throw new Error("Tài khoản chưa được cấp quyền Platform Admin.");
          setUser(profile);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!user) return;
    const focusSearch = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" && !document.querySelector("dialog[open]")) {
        event.preventDefault();
        searchInput.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, [user]);
  useEffect(() => {
    const expired = () => {
      setUser(null);
      setTenants([]);
      setSelected(null);
      setError("Phiên đăng nhập đã hết hạn.");
    };
    window.addEventListener("tenant:session-expired", expired);
    return () => window.removeEventListener("tenant:session-expired", expired);
  }, []);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    setListing(true);
    tenantApi
      .list(page, controller.signal, query)
      .then((result) => {
        if (!controller.signal.aborted) {
          setTenants(result.items);
          setSelected((previous) =>
            previous
              ? result.items.find((tenant) => tenant.id === previous.id) ||
              previous
              : result.items[0] || null,
          );
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setListing(false);
      });
    return () => controller.abort();
  }, [user, page, revision, query]);
  useEffect(() => {
    if (!user || !routeKey || selected) return;
    const controller = new AbortController();
    tenantApi.detailByKey(routeKey, controller.signal)
      .then(tenant => { if (!controller.signal.aborted) setSelected(tenant); })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [user, routeKey, selected]);
  const selectedId = selected?.id;
  useEffect(() => {
    if (!user || !selectedId || !revision) return;
    const controller = new AbortController();
    tenantApi.detail(selectedId, controller.signal).then(tenant => {
      if (!controller.signal.aborted) setSelected(previous => previous?.id === selectedId ? tenant : previous);
    }).catch(() => { /* The company directory also refreshes after changes. */ });
    return () => controller.abort();
  }, [user, selectedId, revision]);
  // #endregion
  // #region Handlers
  async function login(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await tenantApi.login(
        form.get("email"),
        form.get("password"),
      );
      if (!result.user.isPlatformAdmin)
        throw new Error("Tài khoản chưa được cấp quyền Platform Admin.");
      localStorage.setItem("oneportal.tenant.token", result.token);
      setUser(result.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function mutate(action, message) {
    if (busy) return false;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await action();
      if (result?.tenant) setSelected(result.tenant);
      setNotice(message);
      setRevision((value) => value + 1);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function createTenant(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!data.getAll("applications").length) {
      setError("Chọn ít nhất một ứng dụng.");
      return;
    }
    if (
      await mutate(
        () =>
          tenantApi.create({
            key: data.get("key"),
            name: data.get("name"),
            applications: data.getAll("applications"),
            adminEmail: data.get("adminEmail") || null,
          }),
        "Đã tạo công ty và khởi tạo dữ liệu nền tảng.",
      )
    ) {
      setCreating(false);
      setSearch("");
      setPage(1);
      setAppKey(
        data.getAll("applications")[0],
      );
      navigate(tenantPath(data.get("key"), "members", data.getAll("applications")[0]));
    }
  }
  function logout() {
    localStorage.removeItem("oneportal.tenant.token");
    setUser(null);
    setTenants([]);
    setSelected(null);
    setAppKey(null);
    setCreating(false);
    setChangingAccess(false);
    setRemoval(null);
    setError("");
    setNotice("");
  }
  // #endregion
  function selectSection(next) {
    navigate(tenantPath(selected?.key, next, next === "settings" || next === "members" ? appKey : undefined));
  }

  function openRemoval(tenant, appToRemove) {
    setError("");
    setRemoval({ tenant, appKey: appToRemove });
  }

  async function confirmRemoval(confirmKey, purge) {
    if (!removal || busy || (!removal.appKey && confirmKey !== removal.tenant.key)) return;
    const { tenant, appKey: appToRemove } = removal;
    const saved = await mutate(
      () => appToRemove ? tenantApi.uninstall(tenant.id, appToRemove, purge) : tenantApi.remove(tenant.id, { confirmKey, force: purge }),
      appToRemove ? "Đã gỡ cài đặt " + getApplicationName(appToRemove) + "." : "Đã xóa công ty.",
    );
    if (!saved) return;
    setRemoval(null);
    if (!appToRemove) {
      setTenants(previous => previous.filter(item => item.id !== tenant.id));
      if (selected?.id === tenant.id) setSelected(tenants.find(item => item.id !== tenant.id) ?? null);
      setAppKey(null);
      setSearch("");
      setPage(1);
      navigate(paths.tenants, { replace: true });
    }
  }
  if (checking)
    return (
      <main className="portal-login" role="status">
        <span className="portal-pending"><IconLabel icon={LoaderCircle}>Đang kiểm tra phiên đăng nhập…</IconLabel></span>
      </main>
    );
  if (!user)
    return (
      <main className="portal-login">
        <section className="login-panel uv-page-enter">
          <div className="portal-brand">
            <Building2 size={24} aria-hidden="true" />
            OnePortal
          </div>
          <h1>Quản trị nền tảng</h1>
          <p className="muted">
            Quản lý công ty, ứng dụng và quyền người dùng.
          </p>
          {error && (
            <p role="alert" className="portal-notice portal-error">
              <IconLabel icon={CircleAlert}>{error}</IconLabel>
            </p>
          )}
          <form onSubmit={login} className="form-stack">
            <Field
              name="email"
              type="email"
              label="Email"
              icon={Mail}
              autoComplete="username"
              required
            />
            <Field
              name="password"
              type="password"
              label="Mật khẩu"
              icon={KeyRound}
              autoComplete="current-password"
              required
            />
            <UiverseButton type="submit" isLoading={busy} icon={<LogIn className="tenant-icon" aria-hidden="true" />}>
              {busy ? "Đang đăng nhập…" : "Đăng nhập"}
            </UiverseButton>
          </form>
        </section>
      </main>
    );
  const application = selected?.applications.find(
    (app) => app.appKey === appKey,
  );
  const ready =
    selected?.isActive &&
    application?.isEnabled &&
    application.provisioningStatus === "Ready";
  const appName = getApplicationName(appKey);
  const appStatus = !selected?.isActive
    ? { label: "Công ty đã khóa", icon: LockKeyhole }
    : !application?.isEnabled
      ? { label: "Chưa bật ứng dụng", icon: CircleMinus }
      : ready
        ? { label: "Sẵn sàng", icon: CircleCheck, tone: "ready" }
        : application.provisioningStatus === "Failed"
          ? { label: "Khởi tạo thất bại", icon: CircleAlert, tone: "failed" }
          : { label: "Đang khởi tạo", icon: LoaderCircle, tone: "portal-pending" };
  const configure = key => {
    setAppKey(key);
    navigate(tenantPath(selected.key, "settings", key));
  };
  const chooseTenant = tenant => {
    setSelected(tenant);
    setAppKey(null);
    setError("");
    setNotice("");
    if (routeKey) navigate(tenantPath(tenant.key, section));
  };
  const memberKey = selected?.id + ":" + appKey;

  return (
    <div className="cr-shell">
      <CommandRail section={section} onSectionChange={selectSection} hasTenant={Boolean(selected)}
        onCreate={() => { setCreating(true); setError(""); }} onLogout={logout} />
      <main className="portal-main">
        <PortalHeader tenant={selected} appKey={appKey} search={search} searchInput={searchInput} onSearch={setSearch} onLogout={logout}
          onCreate={() => { setCreating(true); setError(""); }} />
        <header className="page-heading cr-heading">
          <div>
            <p className="cr-context">OnePortal / Quản trị nền tảng</p>
            <h1>{{ overview: "Tổng quan công ty", tenants: "Quản lý công ty", members: "Quản lý User", settings: "Cấu hình công ty", store: "App Store" }[section]}</h1>
          </div>
        </header>
        {error && !creating && !changingAccess && !removal && <p role="alert" className="portal-notice portal-error"><IconLabel icon={CircleAlert}>{error}</IconLabel></p>}
        {notice && <p role="status" className="portal-notice"><IconLabel icon={CircleCheck}>{notice}</IconLabel></p>}
        <TenantSwitcher tenants={tenants} selected={selected} query={query} listing={listing} page={page}
          onSelect={chooseTenant} onPageChange={setPage} onRemove={section === "tenants" ? openRemoval : undefined} />
        {selected ? <div className="bento-grid" aria-label="Quản lý công ty">
          {section === "members" && <section className="bento-box bento-detail" key={selected.id + ":members"}>
            <MemberPanel tenant={selected} appKey={appKey} onChanged={() => setRevision(value => value + 1)} />
          </section>}
          <section className="bento-box bento-workspace" onPointerMove={spotlight}>
            <p className="cr-context"><IconLabel icon={Building2}>Workspace</IconLabel></p>
            <h2>{selected.name}</h2>
            <div className="context-line">
              <code>{selected.key}</code>
              <span className={"status " + (selected.isActive ? "ready" : "failed")}>
                <IconLabel icon={selected.isActive ? CircleCheck : LockKeyhole}>{selected.isActive ? "Đang hoạt động" : "Công ty đã khóa"}</IconLabel>
              </span>
            </div>
            <dl className="workspace-metrics">
              <div><dt>Ứng dụng đã bật</dt><dd>{selected.applications.filter(app => app.isEnabled).length} / {applications.length}</dd></div>
              <div><dt>Người dùng đang hoạt động</dt><dd>{selected.activeMemberCount ?? "—"}</dd></div>
            </dl>
            <div className="workspace-actions">
              <button type="button" className="portal-secondary" onClick={() => configure(appKey)}><IconLabel icon={Settings}>Mở cấu hình</IconLabel></button>
              {section !== "settings" && <button type="button" className="portal-secondary" disabled={busy} onClick={() => { setError(""); setChangingAccess(true); }}>
                <IconLabel icon={selected.isActive ? LockKeyhole : LockKeyholeOpen}>{selected.isActive ? "Khóa công ty" : "Mở công ty"}</IconLabel>
              </button>}
            </div>
          </section>
          <section className="bento-box bento-apps" onPointerMove={spotlight}>
            <AppStore tenant={selected} loading={busy} appKey={appKey} full={section === "store"}
              onSelect={key => {
                setAppKey(key);
                if (routeKey) navigate(tenantPath(selected.key, section === "store" ? "members" : section, key));
                setError(""); setNotice("");
              }}
              onConfigure={configure}
              onUninstall={key => openRemoval(selected, key)}
              onInstall={(key, allowSelfRegistration) => mutate(
                () => tenantApi.configure(selected.id, key, { isEnabled: true, allowSelfRegistration }),
                "Đã cài " + getApplicationName(key) + ".",
              )}
            />
          </section>
          {section === "settings" &&
            <section className="bento-box bento-detail" key={memberKey + ":settings"}>
              <div className="bento-detail-context">
                <span>{appName}</span>
                <span className={"status " + (appStatus.tone || "")}><IconLabel icon={appStatus.icon}>{appStatus.label}</IconLabel></span>
              </div>
              <ApplicationSettings
                key={memberKey + JSON.stringify(application) + selected.isActive + selected.name}
                tenant={selected} appKey={appKey} application={application} busy={busy}
                onConfigure={value => mutate(() => tenantApi.configure(selected.id, appKey, value), "Đã lưu cấu hình ứng dụng.")}
                onUpdate={value => mutate(() => tenantApi.update(selected.id, value), "Đã cập nhật công ty.")}
                onChangeAccess={() => { setError(""); setChangingAccess(true); }}
                onUninstall={application?.isEnabled ? () => openRemoval(selected, appKey) : null}
                onDelete={() => openRemoval(selected)}
              />
            </section>
          }
        </div> : !listing && <p className="empty-state">Chọn công ty để quản lý ứng dụng và người dùng.</p>}
      </main>
      {removal && <TenantRemovalDialog removal={removal} busy={busy} error={error} onConfirm={confirmRemoval}
        onClose={() => { setRemoval(null); setError(""); }} />}
      {changingAccess && selected && <TenantAccessDialog tenant={selected} busy={busy} error={error}
        onClose={() => { setError(""); setChangingAccess(false); }} onConfirm={async () => {
          const saved = await mutate(() => tenantApi.update(selected.id, { name: selected.name, isActive: !selected.isActive }), "Đã cập nhật công ty.");
          if (saved) setChangingAccess(false);
        }} />}
      {creating && (
        <Modal
          title="Thêm công ty"
          icon={Building2}
          onClose={() => setCreating(false)}
          busy={busy}
        >
          <form className="form-stack" onSubmit={createTenant}>
            {error && (
              <p role="alert" className="portal-notice portal-error">
                <IconLabel icon={CircleAlert}>{error}</IconLabel>
              </p>
            )}
            <Field label="Tên công ty" icon={Building2} name="name" maxLength={200} required />
            <Field
              label="Mã workspace"
              icon={Fingerprint}
              name="key"
              pattern="[a-z0-9](?:[a-z0-9]|-){1,62}"
              maxLength={63}
              hint="Chữ thường, số và dấu gạch ngang; dùng trong đường dẫn ứng dụng."
              required
            />
            <fieldset>
              <legend className="field-label mb-2"><IconLabel icon={Store}>Ứng dụng sử dụng</IconLabel></legend>
              <div className="application-options">
                {applications.map(({ key, name, icon }) => (
                  <label key={key}>
                    <input type="checkbox" name="applications" value={key} defaultChecked={key === "quoting"} />
                    <IconLabel icon={icon}>{name}</IconLabel>
                  </label>
                ))}
              </div>
            </fieldset>
            <Field
              label="Email quản trị viên đã có"
              icon={UserCog}
              name="adminEmail"
              type="email"
              hint="Không bắt buộc. Bạn có thể thêm quản trị viên sau khi tạo công ty."
            />
            <div className="form-actions">
              <button
                type="button"
                className="portal-secondary"
                disabled={busy}
                onClick={() => setCreating(false)}
              >
                <IconLabel icon={X}>Hủy</IconLabel>
              </button>
              <UiverseButton type="submit" isLoading={busy} icon={<Plus className="tenant-icon" aria-hidden="true" />}>
                {busy ? "Đang khởi tạo…" : "Tạo công ty"}
              </UiverseButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
