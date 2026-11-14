import React, { useEffect, useState } from 'react';
import { Building2, LogOut, Plus } from 'lucide-react';
import { tenantApi } from './api/tenantApi';
import Field from './components/Field';
import MemberPanel from './components/MemberPanel';
import Modal from './components/Modal';
import ApplicationSettings from './components/ApplicationSettings';

export default function App() {
  // #region State and effects
  const [user, setUser] = useState(null), [checking, setChecking] = useState(true), [busy, setBusy] = useState(false), [listing, setListing] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [tenants, setTenants] = useState([]), [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null), [chosenAppKey, setAppKey] = useState(null), [revision, setRevision] = useState(0), [section, setSection] = useState('members');
  const [creating, setCreating] = useState(false), [search, setSearch] = useState(''), [query, setQuery] = useState('');
  const appKey = chosenAppKey || selected?.applications.find(app => app.appKey === 'quoting' && app.isEnabled)?.appKey || selected?.applications.find(app => app.isEnabled)?.appKey || 'quoting';
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
  useEffect(() => { const timeout = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300); return () => clearTimeout(timeout); }, [search]);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController(); setListing(true);
    tenantApi.list(page, controller.signal, query).then(result => { if (!controller.signal.aborted) {
      setTenants(result.items); setSelected(previous => previous ? result.items.find(tenant => tenant.id === previous.id) || previous : result.items[0] || null);
    } }).catch(error => { if (!controller.signal.aborted) setError(error.message); }).finally(() => { if (!controller.signal.aborted) setListing(false); });
    return () => controller.abort();
  }, [user, page, revision, query]);
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
    if (busy) return false; setBusy(true); setError(''); setNotice('');
    try {
      const result = await action(); if (result?.tenant) setSelected(result.tenant);
      setNotice(message); setRevision(value => value + 1); return true;
    } catch (error) { setError(error.message); return false; } finally { setBusy(false); }
  }
  async function createTenant(event) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    if (!data.getAll('applications').length) { setError('Chọn ít nhất một ứng dụng.'); return; }
    if (await mutate(() => tenantApi.create({ key: data.get('key'), name: data.get('name'), applications: data.getAll('applications'), adminEmail: data.get('adminEmail') || null }), 'Đã tạo công ty và khởi tạo dữ liệu nền tảng.')) {
      setCreating(false); setSearch(''); setPage(1); setAppKey(data.getAll('applications').includes('quoting') ? 'quoting' : 'landing'); setSection('members');
    }
  }
  function logout() { localStorage.removeItem('oneportal.tenant.token'); setUser(null); setTenants([]); setSelected(null); setAppKey(null); setError(''); setNotice(''); }
  // #endregion
  if (checking) return <main className="portal-login" role="status">Đang kiểm tra phiên đăng nhập…</main>;
  if (!user) return <main className="portal-login"><section className="login-panel"><div className="portal-brand"><Building2 size={24}/>OnePortal</div><h1>Quản trị nền tảng</h1><p className="muted">Quản lý công ty, ứng dụng và quyền người dùng.</p>
    {error && <p role="alert" className="portal-notice portal-error">{error}</p>}<form onSubmit={login} className="form-stack"><Field name="email" type="email" label="Email" autoComplete="username" required/><Field name="password" type="password" label="Mật khẩu" autoComplete="current-password" required/><button className="portal-button" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button></form></section></main>;
  const application = selected?.applications.find(app => app.appKey === appKey);
  const ready = selected?.isActive && application?.isEnabled && application.provisioningStatus === 'Ready';
  const appName = appKey === 'quoting' ? 'Quoting' : 'Landing Page';
  return <div><header className="portal-header"><div className="portal-brand"><Building2 size={24}/>OnePortal <span className="portal-caption">Quản trị nền tảng</span></div><button className="portal-secondary" onClick={logout}><LogOut size={16}/>Đăng xuất</button></header>
    <main className="portal-main"><div className="page-heading"><div><h1>Công ty & người dùng</h1><p>Chọn công ty, chọn ứng dụng, rồi cấp quyền cho người dùng.</p></div><button className="portal-button" onClick={() => { setCreating(true); setError(''); }}><Plus size={16}/>Thêm công ty</button></div>
      {error && !creating && <p role="alert" className="portal-notice portal-error">{error}</p>}{notice && <p role="status" className="portal-notice">{notice}</p>}
      <div className="portal-workbench"><aside className="directory" aria-label="Danh sách công ty"><h2 className="directory-title">CÔNG TY</h2><Field label="Tìm công ty" type="search" placeholder="Tên hoặc mã công ty" value={search} onChange={event => setSearch(event.target.value)}/>
        {listing && <p role="status" className="muted mt-3">Đang tải công ty…</p>}<ul className="directory-list" aria-busy={listing}>{tenants.map(tenant => <li key={tenant.id}><button className="tenant-choice" aria-current={selected?.id === tenant.id ? 'true' : undefined} onClick={() => { setSelected(tenant); setAppKey(tenant.applications.some(app => app.appKey === 'quoting') ? 'quoting' : 'landing'); setSection('members'); setError(''); setNotice(''); }}><strong>{tenant.name}</strong><small>{tenant.key}{!tenant.isActive && ' · Đã khóa'}</small></button></li>)}</ul>
        {!tenants.length && !listing && <p className="empty-state">{query ? 'Không tìm thấy công ty phù hợp.' : 'Chưa có công ty. Thêm công ty để bắt đầu.'}</p>}
        <div className="pagination"><button className="portal-secondary" disabled={listing || page === 1} onClick={() => setPage(page - 1)}>Trước</button><span>Trang {page}</span><button className="portal-secondary" disabled={listing || tenants.length < 20} onClick={() => setPage(page + 1)}>Sau</button></div>
      </aside><section className="tenant-detail" aria-label="Quản lý công ty">{selected ? <>
        <h2>{selected.name}</h2><div className="context-line"><span>{selected.key}</span><span className={'status ' + (ready ? 'ready' : application?.provisioningStatus === 'Failed' ? 'failed' : '')}>{!selected.isActive ? 'Công ty đã khóa' : !application?.isEnabled ? 'Chưa bật ứng dụng' : application.provisioningStatus === 'Ready' ? 'Sẵn sàng' : application.provisioningStatus === 'Failed' ? 'Khởi tạo thất bại' : 'Đang khởi tạo'}</span></div>
        <div className="app-tabs" aria-label="Ứng dụng">{['quoting', 'landing'].map(key => <button key={key} aria-pressed={appKey === key} onClick={() => { setAppKey(key); setError(''); setNotice(''); }}>{key === 'quoting' ? 'Quoting' : 'Landing Page'}</button>)}</div>
        <div className="section-tabs" aria-label={'Quản lý ' + appName}><button aria-pressed={section === 'members'} onClick={() => setSection('members')}>Người dùng</button><button aria-pressed={section === 'settings'} onClick={() => setSection('settings')}>Cấu hình</button></div>
        {section === 'members' ? ready ? <MemberPanel key={selected.id + appKey} tenant={selected} appKey={appKey}/> : <div className="empty-state"><h3>Ứng dụng chưa sẵn sàng</h3><p>Mở Cấu hình để bật ứng dụng hoặc kiểm tra khởi tạo dữ liệu.</p><button className="portal-secondary mt-4" onClick={() => setSection('settings')}>Mở cấu hình</button></div>
          : <ApplicationSettings key={selected.id + appKey + JSON.stringify(application) + selected.isActive + selected.name} tenant={selected} appKey={appKey} application={application} busy={busy}
            onConfigure={value => mutate(() => tenantApi.configure(selected.id, appKey, value), 'Đã lưu cấu hình ứng dụng.')}
            onUpdate={value => mutate(() => tenantApi.update(selected.id, value), 'Đã cập nhật công ty.')}/>}
      </> : <div className="empty-state"><h3>Chọn công ty để quản lý</h3><p>Ứng dụng và người dùng của công ty sẽ hiển thị tại đây.</p></div>}</section></div>
    </main>
    {creating && <Modal title="Thêm công ty" onClose={() => setCreating(false)} busy={busy}><form className="form-stack" onSubmit={createTenant}>
      {error && <p role="alert" className="portal-notice portal-error">{error}</p>}<Field label="Tên công ty" name="name" maxLength={200} required/><Field label="Mã workspace" name="key" pattern="[a-z0-9](?:[a-z0-9]|-){1,62}" maxLength={63} hint="Chữ thường, số và dấu gạch ngang; dùng trong đường dẫn ứng dụng." required/>
      <fieldset><legend className="field-label mb-2">Ứng dụng sử dụng</legend><div className="flex flex-wrap gap-5"><label><input type="checkbox" name="applications" value="quoting" defaultChecked/> Quoting</label><label><input type="checkbox" name="applications" value="landing"/> Landing Page</label></div></fieldset>
      <Field label="Email quản trị viên đã có" name="adminEmail" type="email" hint="Không bắt buộc. Bạn có thể thêm quản trị viên sau khi tạo công ty."/>
      <div className="form-actions"><button type="button" className="portal-secondary" disabled={busy} onClick={() => setCreating(false)}>Hủy</button><button className="portal-button" disabled={busy}>{busy ? 'Đang khởi tạo…' : 'Tạo công ty'}</button></div>
    </form></Modal>}
  </div>;
}
