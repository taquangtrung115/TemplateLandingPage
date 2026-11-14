import React, { useEffect, useState } from 'react';
import { workspaceApi } from '../api/workspaceApi';
export default function WorkspaceMembers() {
  const [items, setItems] = useState([]), [page, setPage] = useState(1), [error, setError] = useState(''), [busy, setBusy] = useState(false), [revision, setRevision] = useState(0);
  const [email, setEmail] = useState(''), [role, setRole] = useState('User');
  useEffect(() => {
    const controller = new AbortController(); setBusy(true);
    workspaceApi.members(page, controller.signal).then(result => { if (!controller.signal.aborted) setItems(result.items); })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [page, revision]);
  async function save(value) { if (busy) return; setBusy(true); setError(''); try { await workspaceApi.setMember(value); setEmail(''); setRevision(value => value + 1); } catch (error) { setError(error.message); } finally { setBusy(false); } }
  return <section className="mx-auto w-full max-w-4xl rounded-xl border bg-white p-5 text-slate-900"><h1 className="text-2xl font-semibold">Thành viên workspace</h1><p className="mt-2 text-sm text-slate-500">Quyền chỉ áp dụng trong workspace và ứng dụng hiện tại.</p>
    {error && <p role="alert" className="my-3 text-red-700">{error}</p>}<form className="my-5 flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); save({ email, role, isActive: true }); }}><label className="flex-1 text-sm">Email tài khoản đã có<input className="mt-1 block w-full rounded border p-2" type="email" required value={email} onChange={event => setEmail(event.target.value)}/></label><label className="text-sm">Vai trò<select className="mt-1 block rounded border p-2" value={role} onChange={event => setRole(event.target.value)}><option>User</option><option>Admin</option></select></label><button className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50" disabled={busy}>Cấp quyền</button></form>
    <ul className="divide-y">{items.map(member => <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{member.fullName}</p><p className="text-sm text-slate-500">{member.email} · {member.role} · {member.isActive ? 'Hoạt động' : 'Đã khóa'}</p></div><button disabled={busy} className="rounded border px-3 py-2 text-sm" onClick={() => save({ email: member.email, role: member.role, isActive: !member.isActive })}>{member.isActive ? 'Khóa quyền' : 'Mở quyền'}</button></li>)}</ul>
    {!items.length && !busy && <p className="py-4 text-sm text-slate-500">Chưa có thành viên.</p>}<div className="mt-4 flex gap-4"><button disabled={busy || page === 1} onClick={() => setPage(page - 1)}>Trước</button><span>Trang {page}</span><button disabled={busy || items.length < 20} onClick={() => setPage(page + 1)}>Sau</button></div>
  </section>;
}
