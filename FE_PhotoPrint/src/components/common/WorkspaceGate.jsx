import { useCallback, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { UiverseButton, UiverseLoader } from '@oneportal/uiverse-ui';
import { useAuth } from '../../contexts/AuthContext';
import { workspaceApi } from '../../api/workspaceApi';
import { navigateWorkspace, workspaceKey } from '../../utils/tenantScope';
import { paths } from '../../routes/paths';
import useRequest from '../../hooks/useRequest';
import RequestState from './RequestState';

function WorkspaceOptions({ denied = false }) {
  const [page, setPage] = useState(1);
  const load = useCallback(signal => workspaceApi.contexts(page, signal), [page]);
  const contexts = useRequest(load);
  const items = contexts.data?.items || [];
  const adminContexts = items.filter(item => item.role === 'Admin');
  return <section className="shell page-section form-stack">
    {denied && <><h1>Quản trị Photo Print</h1><p>Bạn cần quyền quản trị của workspace để mở trang này.</p></>}
    <RequestState result={contexts}>
      {adminContexts.map(item => <UiverseButton key={item.tenantKey} variant="outline" disabled={item.tenantKey === workspaceKey()}
        onClick={() => navigateWorkspace(item.tenantKey)}>{item.tenantName} · {item.tenantKey}</UiverseButton>)}
      {(page > 1 || items.length === 100) && <div className="action-row">
        <UiverseButton size="small" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</UiverseButton>
        <UiverseButton size="small" variant="outline" disabled={items.length < 100} onClick={() => setPage(page + 1)}>Sau</UiverseButton>
      </div>}
    </RequestState>
  </section>;
}

export { WorkspaceOptions };

export default function WorkspaceGate() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.loading) return <div className="shell page-section"><UiverseLoader label="Đang kiểm tra phiên quản trị…" /></div>;
  if (!auth.token) return <Navigate to={paths.login} replace state={{ from: location.pathname + location.search }} />;
  if (auth.error) return <div className="shell page-section form-stack"><p role="alert" className="notice notice-error">{auth.error}</p>
    <UiverseButton variant="outline" onClick={auth.retry}>Thử lại</UiverseButton><WorkspaceOptions denied /></div>;
  if (!auth.isAdmin) return <><WorkspaceOptions denied /><div className="shell action-row">
    <UiverseButton variant="outline" onClick={auth.logout}>Đăng xuất</UiverseButton><Link to={paths.home}>Về tiệm ảnh</Link>
  </div></>;
  return <Outlet />;
}
