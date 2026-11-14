import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { workspaceApi } from '../api/workspaceApi';
import { DEFAULT_TENANT_KEY, workspaceKey, workspaceBasename, navigateWorkspace } from '../utils/tenantScope';

export default function WorkspaceGate({ children }) {
  const { user, isAuthenticated, loading, applyWorkspaceRole, logout } = useAuth();
  const [contexts, setContexts] = useState(null), [error, setError] = useState(''), [revision, setRevision] = useState(0), [page, setPage] = useState(1);
  useEffect(() => {
    if (loading || !isAuthenticated) { setContexts(null); return; }
    const controller = new AbortController(); setError('');
    workspaceApi.contexts(page, controller.signal).then(result => {
      if (controller.signal.aborted) return;
      const entries = result.items || []; setContexts(entries);
      const current = entries.find(context => context.tenantKey === workspaceKey());
      if (current) applyWorkspaceRole?.(current.role);
      if (!workspaceBasename() && entries.length === 1 && page === 1) navigateWorkspace(entries[0].tenantKey);
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [loading, isAuthenticated, user?.id, revision, page, applyWorkspaceRole]);
  if (!isAuthenticated || loading) return children;
  const current = contexts?.find(context => context.tenantKey === workspaceKey());
  if (error || !contexts || !current || (!workspaceBasename() && contexts.length > 1)) return <section className="mx-auto my-8 w-full max-w-xl rounded-xl border bg-white p-6 text-slate-900"><h1 className="text-xl font-semibold">Chọn công ty / workspace</h1>
    {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
    {!contexts && !error && <p role="status" className="mt-4">Đang tải workspace…</p>}
    {contexts?.length === 0 && <p className="mt-4">Tài khoản chưa được cấp quyền workspace cho ứng dụng này.</p>}
    <div className="mt-4 grid gap-3">{contexts?.map(context => <button key={context.tenantId} className="rounded-lg border p-3 text-left hover:bg-blue-50" onClick={() => navigateWorkspace(context.tenantKey)}>{context.tenantName}<span className="ml-2 text-sm text-slate-500">{context.role}</span></button>)}</div>
    <div className="mt-4 flex gap-3"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</button><button disabled={!contexts || contexts.length < 100} onClick={() => setPage(page + 1)}>Sau</button><button onClick={() => setRevision(value => value + 1)}>Tải lại</button><button onClick={() => logout?.()}>Đăng xuất</button></div>
  </section>;
  return <><div className="flex flex-wrap items-center justify-end gap-2 border-b bg-white px-4 py-2 text-sm text-slate-900"><label>Workspace <select aria-label="Workspace" className="ml-2 rounded border bg-white px-2 py-1 text-slate-900" value={current.tenantKey} onChange={event => navigateWorkspace(event.target.value)}>{contexts.map(context => <option key={context.tenantId} value={context.tenantKey}>{context.tenantName}</option>)}</select></label><span className="text-xs text-slate-500">{current.role}</span></div>{children}</>;
}
