import React, { useEffect, useState } from 'react';
import { Building2, LogOut, Plus } from 'lucide-react';
import { tenantApi } from './api/tenantApi';
import Field from './components/Field';
import MemberPanel from './components/MemberPanel';

export default function App() {
  // #region State and effects
  const [user, setUser] = useState(null), [checking, setChecking] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [tenants, setTenants] = useState([]), [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null), [appKey, setAppKey] = useState('quoting'), [revision, setRevision] = useState(0);
  const [creating, setCreating] = useState(false), [creatingUser, setCreatingUser] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    if (!localStorage.getItem('oneportal.tenant.token')) { setChecking(false); return; }
    tenantApi.me(controller.signal).then(profile => { if (!controller.signal.aborted) { if (!profile.isPlatformAdmin) throw new Error('Tài khoản chưa được cấp quyền Platform Admin.'); setUser(profile); } })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); }).finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const expired = () => { setUser(null); setTenants([]); setSelected(null); setError('Phiên đăng nhập đã hết hạn.'); };
    window.addEventListener('tenant:session-expired', expired); return () => window.removeEventListener('tenant:session-expired', expired);
  }, []);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController(); setBusy(true);
    tenantApi.list(page, controller.signal).then(result => { if (!controller.signal.aborted) { setTenants(result.items); setSelected(previous => result.items.find(tenant => tenant.id === previous?.id) || null); } })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [user, page, revision]);
  // #endregion

  // #region Handlers
  async function login(event) {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await tenantApi.login(form.get('email'), form.get('password'));
      if (!result.user.isPlatformAdmin) throw new Error('Tài khoản chưa được cấp quyền Platform Admin.');
      localStorage.setItem('oneportal.tenant.token', result.token); setUser(result.user);
    } catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  async function mutate(action, message) {
    if (busy) return; setBusy(true); setError(''); setNotice('');
    try { await action(); setNotice(message); setRevision(value => value + 1); return true; }
    catch (error) { setError(error.message); return false; } finally { setBusy(false); }
  }
  async function createTenant(event) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    if (await mutate(() => tenantApi.create({ key: data.get('key'), name: data.get('name'), applications: data.getAll('applications'), adminEmail: data.get('adminEmail') || null }), 'Đã tạo workspace và khởi tạo dữ liệu nền tảng.')) setCreating(false);
  }
  async function createUser(event) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    if (await mutate(() => tenantApi.createUser({ fullName: data.get('fullName'), email: data.get('email'), password: data.get('password') }), 'Đã tạo tài khoản. Bạn có thể cấp quyền workspace cho tài khoản này.')) setCreatingUser(false);
  }
  // #endregion

  if (checking) return <main className="p-8" role="status">Đang kiểm tra phiên đăng nhập…</main>;
  if (!user) return <main className="mx-auto flex min-h-screen max-w-md items-center p-5"><section className="card w-full"><Building2 className="mb-5 text-blue-700" size={32}/><p className="text-xs font-bold uppercase tracking-widest text-blue-700">OnePortal</p><h1 className="mb-6 mt-2 text-2xl font-semibold">Quản trị nền tảng</h1>
    {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}<form onSubmit={login} className="space-y-4"><Field name="email" type="email" label="Email" autoComplete="username" required/><Field name="password" type="password" label="Mật khẩu" autoComplete="current-password" required/><button className="button w-full" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button></form></section></main>;

  return <div className="min-h-screen"><header className="border-b bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="flex items-center gap-3"><Building2 className="text-blue-700"/><span className="font-semibold">OnePortal <span className="ml-2 font-normal text-slate-500">Quản trị tenant</span></span></div><button className="secondary inline-flex items-center gap-2" onClick={() => { localStorage.removeItem('oneportal.tenant.token'); setUser(null); setTenants([]); setSelected(null); }}><LogOut size={16}/>Đăng xuất</button></div></header>
    <main className="mx-auto max-w-7xl p-5 sm:p-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-slate-500">Nền tảng / Workspaces</p><h1 className="mt-1 text-3xl font-semibold">Công ty & workspace</h1></div><div className="flex flex-wrap gap-2"><button className="secondary" onClick={() => { setCreatingUser(!creatingUser); setCreating(false); }}>Tạo tài khoản</button><button className="button" onClick={() => { setCreating(!creating); setCreatingUser(false); }}><Plus size={16}/>Tạo workspace</button></div></div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}{notice && <p role="status" className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">{notice}</p>}
      {creating && <form className="card mb-5 grid gap-4 sm:grid-cols-2" onSubmit={createTenant}><h2 className="text-lg font-semibold sm:col-span-2">Workspace mới</h2><Field label="Tên công ty" name="name" maxLength={200} required/><Field label="Mã workspace" name="key" pattern="[a-z0-9][a-z0-9-]{1,62}" required/><Field label="Email quản trị viên đã có" name="adminEmail" type="email"/><fieldset><legend className="mb-2 text-sm font-medium">Ứng dụng</legend><div className="flex gap-5"><label><input type="checkbox" name="applications" value="landing" className="mr-2"/>Landing</label><label><input type="checkbox" name="applications" value="quoting" defaultChecked className="mr-2"/>Quoting</label></div></fieldset><div className="flex gap-2 sm:col-span-2"><button className="button" disabled={busy}>Tạo & khởi tạo dữ liệu</button><button type="button" className="secondary" onClick={() => setCreating(false)}>Hủy</button></div></form>}
      {creatingUser && <form className="card mb-5 grid gap-4 sm:grid-cols-3" onSubmit={createUser}><Field label="Họ tên" name="fullName" required/><Field label="Email tài khoản mới" name="email" type="email" required/><Field label="Mật khẩu ban đầu" name="password" type="password" minLength={8} required autoComplete="new-password"/><div className="sm:col-span-3"><button className="button" disabled={busy}>Lưu tài khoản</button></div></form>}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,1fr)]"><section className="card"><h2 className="mb-4 font-semibold">Danh sách workspace</h2><ul className="divide-y">{tenants.map(tenant => <li key={tenant.id}><button className={'w-full rounded-lg p-3 text-left hover:bg-slate-50 ' + (selected?.id === tenant.id ? 'bg-blue-50' : '')} onClick={() => { setSelected(tenant); setAppKey(tenant.applications[0]?.appKey || 'quoting'); }}><div className="flex flex-wrap justify-between gap-2"><strong>{tenant.name}</strong><span className="text-xs text-slate-500">{tenant.isActive ? 'Hoạt động' : 'Đã khóa'}</span></div><p className="mt-1 text-sm text-slate-500">{tenant.key}</p><p className="mt-2 text-xs text-blue-700">{tenant.applications.filter(app => app.isEnabled).map(app => app.appKey + ' · ' + app.provisioningStatus).join(' / ') || 'Chưa bật ứng dụng'}</p></button></li>)}</ul>{!tenants.length && !busy && <p className="text-sm text-slate-500">Chưa có workspace.</p>}<div className="mt-5 flex items-center gap-3"><button className="secondary" disabled={busy || page === 1} onClick={() => setPage(page - 1)}>Trang trước</button><span className="text-sm">{page}</span><button className="secondary" disabled={busy || tenants.length < 20} onClick={() => setPage(page + 1)}>Trang sau</button></div></section>
        {selected ? <section className="card"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">{selected.name}</h2><p className="text-sm text-slate-500">{selected.key}</p></div><button className="secondary" disabled={busy} onClick={() => mutate(() => tenantApi.update(selected.id, { name: selected.name, isActive: !selected.isActive }), 'Đã cập nhật trạng thái workspace.')}>{selected.isActive ? 'Khóa workspace' : 'Mở workspace'}</button></div>
          <div className="mt-5 space-y-3">{['landing', 'quoting'].map(key => { const app = selected.applications.find(app => app.appKey === key); return <div key={key} className="rounded-lg border p-3"><div className="flex items-center justify-between gap-2"><span className="font-medium">{key === 'landing' ? 'Landing Page' : 'Quoting'}</span><button className="secondary" disabled={busy} onClick={() => mutate(() => tenantApi.configure(selected.id, key, { isEnabled: !app?.isEnabled, allowSelfRegistration: app?.allowSelfRegistration || false }), 'Đã cập nhật ứng dụng.')}>{app?.isEnabled ? 'Tắt ứng dụng' : 'Bật & khởi tạo'}</button></div>{app && <><p className="mt-2 text-xs text-slate-500">{app.provisioningStatus} · Seed v{app.seedVersion}</p>{app.lastInitializationError && <p className="mt-2 text-sm text-red-700">{app.lastInitializationError}</p>}{app.isEnabled && <div className="mt-3 flex flex-wrap gap-2"><button className="secondary" onClick={() => setAppKey(key)}>Thành viên</button><button className="secondary" disabled={busy} onClick={() => mutate(() => tenantApi.configure(selected.id, key, { isEnabled: true, allowSelfRegistration: app.allowSelfRegistration }), 'Đã kiểm tra và khởi tạo dữ liệu thiếu.')}>Chạy lại khởi tạo</button>{key === 'landing' && <button className="secondary" disabled={busy} onClick={() => mutate(() => tenantApi.configure(selected.id, key, { isEnabled: true, allowSelfRegistration: !app.allowSelfRegistration }), 'Đã cập nhật đăng ký workspace.')}>{app.allowSelfRegistration ? 'Đóng tự đăng ký' : 'Mở tự đăng ký'}</button>}</div>}</>}</div>; })}</div>
          {selected.applications.some(app => app.appKey === appKey) && <MemberPanel key={selected.id + appKey} tenant={selected} appKey={appKey}/>}</section> : <section className="card text-sm text-slate-500">Chọn workspace để quản lý ứng dụng, dữ liệu nền tảng và thành viên.</section>}
      </div>
    </main></div>;
}
