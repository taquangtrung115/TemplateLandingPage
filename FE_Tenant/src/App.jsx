import React, { useEffect, useState } from "react";
import {
  Building2, CircleAlert, CircleCheck, CircleMinus, Fingerprint, KeyRound,
  LoaderCircle, LockKeyhole, LogIn, LogOut, Mail, Plus, Search, Settings,
  Store, UserCog, Users, X,
} from "lucide-react";
import { tenantApi } from "./api/tenantApi";
import Field from "./components/Field";
import MemberPanel from "./components/MemberPanel";
import Modal from "./components/Modal";
import ApplicationSettings from "./components/ApplicationSettings";
import AppStore from "./components/AppStore";
import { UiverseButton, UiverseIconLabel as IconLabel } from "@oneportal/uiverse-ui";
import Pagination from "./components/Pagination";
import { applications, getApplicationName } from "./applications";

const requestedTenant = new URLSearchParams(window.location.search).get("tenant") || "";
const initialSection = new URLSearchParams(window.location.search).get("view") === "store" ? "store" : "members";

export default function App() {
  // #region State and effects
  const [user, setUser] = useState(null),
    [checking, setChecking] = useState(true),
    [busy, setBusy] = useState(false),
    [listing, setListing] = useState(false);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [tenants, setTenants] = useState([]),
    [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null),
    [chosenAppKey, setAppKey] = useState(null),
    [revision, setRevision] = useState(0),
    [section, setSection] = useState(initialSection);
  const [creating, setCreating] = useState(false),
    [search, setSearch] = useState(requestedTenant),
    [query, setQuery] = useState(requestedTenant);
  const appKey =
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
      setSection("members");
    }
  }
  function logout() {
    localStorage.removeItem("oneportal.tenant.token");
    setUser(null);
    setTenants([]);
    setSelected(null);
    setAppKey(null);
    setError("");
    setNotice("");
  }
  // #endregion
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
  return (
    <div>
      <header className="portal-header">
        <div className="portal-brand">
          <Building2 size={24} aria-hidden="true" />
          OnePortal <span className="portal-caption">Quản trị nền tảng</span>
        </div>
        <button className="portal-secondary" onClick={logout}>
          <IconLabel icon={LogOut}>Đăng xuất</IconLabel>
        </button>
      </header>
      <main className="portal-main uv-page-enter">
        <div className="page-heading">
          <div>
            <h1>Quản trị công ty</h1>
            <p>Cài ứng dụng và quản lý quyền truy cập theo từng công ty.</p>
          </div>
          <UiverseButton
            icon={<Plus className="tenant-icon" aria-hidden="true" />}
            onClick={() => {
              setCreating(true);
              setError("");
            }}
          >
            Thêm công ty
          </UiverseButton>
        </div>
        {error && !creating && (
          <p role="alert" className="portal-notice portal-error">
            <IconLabel icon={CircleAlert}>{error}</IconLabel>
          </p>
        )}
        {notice && (
          <p role="status" className="portal-notice">
            <IconLabel icon={CircleCheck}>{notice}</IconLabel>
          </p>
        )}
        <div className="portal-workbench">
          <aside className="directory" aria-label="Danh sách công ty">
            <h2 className="directory-title"><IconLabel icon={Building2}>Công ty</IconLabel></h2>
            <Field
              label="Tìm công ty"
              icon={Search}
              type="search"
              placeholder="Tên hoặc mã công ty"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {listing && (
              <p role="status" className="muted mt-3 portal-pending">
                <IconLabel icon={LoaderCircle}>Đang tải công ty…</IconLabel>
              </p>
            )}
            <ul className="directory-list" aria-busy={listing}>
              {tenants.map((tenant) => (
                <li key={tenant.id}>
                  <button
                    className="tenant-choice"
                    aria-current={
                      selected?.id === tenant.id ? "true" : undefined
                    }
                    onClick={() => {
                      setSelected(tenant);
                      setAppKey(
                        tenant.applications.find(app => app.isEnabled)?.appKey || applications[0].key,
                      );
                      setSection("members");
                      setError("");
                      setNotice("");
                    }}
                  >
                    <IconLabel icon={tenant.isActive ? Building2 : LockKeyhole}>
                      <strong>{tenant.name}</strong>
                      <small>
                        {tenant.key}
                        {!tenant.isActive && " · Đã khóa"}
                      </small>
                    </IconLabel>
                  </button>
                </li>
              ))}
            </ul>
            {!tenants.length && !listing && (
              <p className="empty-state">
                {query
                  ? "Không tìm thấy công ty phù hợp."
                  : "Chưa có công ty. Thêm công ty để bắt đầu."}
              </p>
            )}
            <Pagination page={page} canGoNext={tenants.length >= 20} busy={listing} onChange={setPage} />
          </aside>
          <section className="tenant-detail" aria-label="Quản lý công ty">
            {selected ? (
              <>
                <h2>{selected.name}</h2>
                <div className="context-line">
                  <IconLabel icon={Fingerprint}>{selected.key}</IconLabel>
                  <span className={"status " + (appStatus.tone || "")}>
                    <IconLabel icon={appStatus.icon}>{appStatus.label}</IconLabel>
                  </span>
                </div>
                <div className="app-tabs" aria-label="Ứng dụng">
                  {applications.map(({ key, name, icon }) => (
                    <button
                      key={key}
                      aria-pressed={appKey === key}
                      onClick={() => {
                        setAppKey(key);
                        if (section === "store") setSection("members");
                        setError("");
                        setNotice("");
                      }}
                    >
                      <IconLabel icon={icon}>{name}</IconLabel>
                    </button>
                  ))}
                </div>
                <div className="section-tabs" aria-label={"Quản lý " + appName}>
                  <button
                    aria-pressed={section === "members"}
                    onClick={() => setSection("members")}
                  >
                    <IconLabel icon={Users}>Người dùng</IconLabel>
                  </button>
                  <button
                    aria-pressed={section === "settings"}
                    onClick={() => setSection("settings")}
                  >
                    <IconLabel icon={Settings}>Cấu hình</IconLabel>
                  </button>
                  <button aria-pressed={section === "store"} onClick={() => setSection("store")}><IconLabel icon={Store}>Store</IconLabel></button>
                </div>
                <div className="uv-view-enter" key={selected.id + ":" + (section === "store" ? section : appKey + ":" + section)}>
                  {section === "store" ? <AppStore tenant={selected} loading={busy}
                    onConfigure={key => { setAppKey(key); setSection("settings"); }}
                    onInstall={(key, allowSelfRegistration) => mutate(
                      () => tenantApi.configure(selected.id, key, { isEnabled: true, allowSelfRegistration }),
                      "Đã cài " + getApplicationName(key) + ".",
                    )}
                  /> : section === "members" ? (
                    ready ? (
                      <MemberPanel
                        key={selected.id + appKey}
                        tenant={selected}
                        appKey={appKey}
                      />
                    ) : (
                      <div className="empty-state">
                        <h3>Ứng dụng chưa sẵn sàng</h3>
                        <p>
                          Mở Cấu hình để bật ứng dụng hoặc kiểm tra khởi tạo dữ
                          liệu.
                        </p>
                        <button
                          className="portal-secondary mt-4"
                          onClick={() => setSection("settings")}
                        >
                          <IconLabel icon={Settings}>Mở cấu hình</IconLabel>
                        </button>
                      </div>
                    )
                  ) : (
                    <ApplicationSettings
                      key={
                        selected.id +
                        appKey +
                        JSON.stringify(application) +
                        selected.isActive +
                        selected.name
                      }
                      tenant={selected}
                      appKey={appKey}
                      application={application}
                      busy={busy}
                      onConfigure={(value) =>
                        mutate(
                          () => tenantApi.configure(selected.id, appKey, value),
                          "Đã lưu cấu hình ứng dụng.",
                        )
                      }
                      onUpdate={(value) =>
                        mutate(
                          () => tenantApi.update(selected.id, value),
                          "Đã cập nhật công ty.",
                        )
                      }
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <h3>Chọn công ty để quản lý</h3>
                <p>Ứng dụng và người dùng của công ty sẽ hiển thị tại đây.</p>
              </div>
            )}
          </section>
        </div>
      </main>
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
