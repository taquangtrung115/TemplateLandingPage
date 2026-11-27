import { Aperture, ArrowUpRight, Box, Building2, LayoutDashboard, LogOut, MessagesSquare, Package, ReceiptText, Settings } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { UiverseButton, UiverseIconLabel } from '@oneportal/uiverse-ui';
import { useAuth } from '../contexts/AuthContext';
import { useContactConfig } from '../contexts/ContactConfigContext';
import { workspaceKey } from '../utils/tenantScope';
import { WorkspaceOptions } from '../components/common/WorkspaceGate';
import { paths } from '../routes/paths';

const menus = [[paths.admin, 'Tổng quan', LayoutDashboard], [paths.adminServices, 'Sản phẩm', Package], [paths.adminDemos, 'Mẫu 3D', Box],
  [paths.adminOrders, 'Đơn in', ReceiptText], [paths.adminSupport, 'Hỗ trợ', MessagesSquare], [paths.adminSettings, 'Cài đặt', Settings]];

export default function AdminLayout() {
  const auth = useAuth();
  const { config } = useContactConfig();
  const { pathname } = useLocation();
  return <div className="admin-shell">
    <header className="site-header"><div className="shell admin-top">
      <Link className="brand" to={paths.admin}><span className="brand-mark"><Aperture size={20} /></span>{config.brandName || 'Photo Print'}</Link>
      <div className="action-row"><Link className="text-link" to={paths.home} target="_blank" rel="noreferrer">Mở tiệm ảnh <ArrowUpRight size={16} /></Link>
        <UiverseButton variant="outline" size="small" icon={<LogOut size={15} />} onClick={auth.logout}>Đăng xuất</UiverseButton></div>
    </div></header>
    <div className="shell admin-grid">
      <aside className="admin-sidebar">
        <small>Workspace</small><strong className="mono">{workspaceKey()}</strong>
        <nav aria-label="Quản trị tiệm ảnh">{menus.map(([path, label, icon]) => <NavLink end={path === paths.admin} to={path} key={path}><UiverseIconLabel icon={icon}>{label}</UiverseIconLabel></NavLink>)}</nav>
        <details><summary><UiverseIconLabel icon={Building2}>Đổi workspace</UiverseIconLabel></summary><WorkspaceOptions /></details>
      </aside>
      <main className="admin-content"><div className="uv-page-enter" key={pathname}><Outlet /></div></main>
    </div>
  </div>;
}
