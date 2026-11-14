import React, { useEffect, useState } from 'react';
import { tenantApi } from '../api/tenantApi';
import Field from './Field';

export default function MemberPanel({ tenant, appKey }) {
  // #region State and effects
  const [members, setMembers] = useState([]), [page, setPage] = useState(1), [error, setError] = useState('');
  const [busy, setBusy] = useState(false), [email, setEmail] = useState(''), [role, setRole] = useState('User');
  const [revision, setRevision] = useState(0);
  useEffect(() => { setPage(1); setEmail(''); setError(''); }, [tenant.id, appKey]);
  useEffect(() => {
    const controller = new AbortController(); setBusy(true);
    tenantApi.members(tenant.id, appKey, page, controller.signal).then(result => { if (!controller.signal.aborted) setMembers(result.items); })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [tenant.id, appKey, page, revision]);
  // #endregion
  async function save(value) {
    if (busy) return; setBusy(true); setError('');
    try { await tenantApi.setMember(tenant.id, appKey, value); setEmail(''); setRevision(value => value + 1); }
    catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  return <section className="mt-5 border-t pt-5"><h3 className="font-semibold">Thành viên · {appKey}</h3>
    {error && <p role="alert" className="my-3 text-sm text-red-700">{error}</p>}
    <form className="my-4 grid gap-3 sm:grid-cols-[1fr_120px_auto]" onSubmit={event => { event.preventDefault(); save({ email, role, isActive: true }); }}>
      <Field label="Email tài khoản đã có" type="email" value={email} onChange={event => setEmail(event.target.value)} required />
      <label className="text-sm font-medium">Vai trò<select aria-label="Vai trò thành viên" className="field mt-1.5" value={role} onChange={event => setRole(event.target.value)}><option>User</option><option>Admin</option></select></label>
      <button className="button self-end" disabled={busy}>Cấp quyền</button>
    </form>
    <ul className="divide-y">{members.map(member => <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium">{member.email}</p><p className="text-xs text-slate-500">{member.role} · {member.isActive ? 'Đang hoạt động' : 'Đã khóa'}</p></div>
      <button className="secondary" disabled={busy} onClick={() => save({ email: member.email, role: member.role, isActive: !member.isActive })}>{member.isActive ? 'Khóa quyền' : 'Mở quyền'}</button></li>)}</ul>
    {!members.length && !busy && <p className="py-3 text-sm text-slate-500">Chưa có thành viên.</p>}
    <div className="mt-3 flex items-center gap-3"><button className="secondary" disabled={busy || page === 1} onClick={() => setPage(page - 1)}>Trước</button><span className="text-sm">Trang {page}</span><button className="secondary" disabled={busy || members.length < 20} onClick={() => setPage(page + 1)}>Sau</button></div>
  </section>;
}
