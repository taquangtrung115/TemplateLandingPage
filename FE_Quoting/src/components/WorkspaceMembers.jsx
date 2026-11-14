import React, { useEffect, useState } from 'react';
import { workspaceApi } from '../api/workspaceApi';
export default function WorkspaceMembers() {
  const [items, setItems] = useState([]), [page, setPage] = useState(1), [error, setError] = useState(''), [busy, setBusy] = useState(false), [revision, setRevision] = useState(0);
  const [email, setEmail] = useState(''), [role, setRole] = useState('User'), [mode, setMode] = useState('new'), [notice, setNotice] = useState('');
  useEffect(() => {
    const controller = new AbortController(); setBusy(true);
    workspaceApi.members(page, controller.signal).then(result => { if (!controller.signal.aborted) setItems(result.items); })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [page, revision]);
  async function save(value, create = false) { if (busy) return false; setBusy(true); setError(''); setNotice(''); try { if (create) await workspaceApi.createMember(value); else await workspaceApi.setMember(value); setNotice('Đã cập nhật thành viên.'); setEmail(''); setRevision(value => value + 1); return true; } catch (error) { setError(error.message); return false; } finally { setBusy(false); } }
  return <section className="mx-auto w-full max-w-4xl rounded-xl border bg-white p-5 text-slate-900"><h1 className="text-2xl font-semibold">Thành viên workspace</h1><p className="mt-2 text-sm text-slate-500">Quyền chỉ áp dụng trong workspace và ứng dụng hiện tại.</p>
    {error && <p role="alert" className="my-3 text-red-700">{error}</p>}{notice && <p role="status" className="my-3">{notice}</p>}
    <form className="admin-member-form" onSubmit={async event => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const saved = await save({ email, role, ...(mode === 'new' ? { fullName: data.get('fullName'), password: data.get('password') } : { isActive: true }) }, mode === 'new'); if (saved) form.reset(); }}>
      <div className="flex flex-wrap gap-3"><button type="button" className="rounded border px-3 py-2" aria-pressed={mode === 'new'} disabled={busy} onClick={() => setMode('new')}>Tạo tài khoản mới</button><button type="button" className="rounded border px-3 py-2" aria-pressed={mode === 'existing'} disabled={busy} onClick={() => setMode('existing')}>Tài khoản đã có</button></div>
      {mode === 'new' && <label>Họ tên<input name="fullName" maxLength={100} required/></label>}
      <label>Email<input type="email" maxLength={256} required value={email} onChange={event => setEmail(event.target.value)}/></label>
      {mode === 'new' && <label>Mật khẩu ban đầu<input name="password" type="password" minLength={8} maxLength={128} autoComplete="new-password" required/></label>}
      <label>Vai trò<select value={role} onChange={event => setRole(event.target.value)}><option>User</option><option>Admin</option></select></label>
      <div><button className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50" disabled={busy}>{busy ? 'Đang lưu…' : mode === 'new' ? 'Tạo & cấp quyền' : 'Cấp quyền'}</button></div>
    </form>
    <ul className="divide-y">{items.map(member => <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{member.fullName}</p><p className="text-sm text-slate-500">{member.email} · {member.role} · {member.isActive ? 'Hoạt động' : 'Đã khóa'}</p></div><select aria-label={'Vai trò của ' + member.email} disabled={busy} value={member.role} onChange={event => save({ email: member.email, role: event.target.value, isActive: member.isActive })}><option>User</option><option>Admin</option></select><button disabled={busy} className="rounded border px-3 py-2 text-sm" onClick={() => save({ email: member.email, role: member.role, isActive: !member.isActive })}>{member.isActive ? 'Khóa quyền' : 'Mở quyền'}</button></li>)}</ul>
    {!items.length && !busy && <p className="py-4 text-sm text-slate-500">Chưa có thành viên.</p>}<div className="mt-4 flex gap-4"><button disabled={busy || page === 1} onClick={() => setPage(page - 1)}>Trước</button><span>Trang {page}</span><button disabled={busy || items.length < 20} onClick={() => setPage(page + 1)}>Sau</button></div>
  </section>;
}
