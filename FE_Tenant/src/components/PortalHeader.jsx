import { Building2, ChevronDown, LogOut, Plus, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import Field from "./Field";
import { paths, tenantPath } from "../routes/paths";

export default function PortalHeader({ tenant, appKey, search, searchInput, onSearch, onCreate, onLogout }) {
  const nav = [
    [paths.overview, "Tổng quan"], [paths.tenants, "Công ty"],
    [tenant && tenantPath(tenant.key, "store", appKey), "App Store"],
    [tenant && tenantPath(tenant.key, "members", appKey), "Quản lý User"],
    [tenant && tenantPath(tenant.key, "settings", appKey), "Cấu hình"],
  ];
  return <header className="cr-top">
    <div className="cr-top-identity">
      <NavLink to={paths.overview} className="portal-brand"><Building2 className="tenant-icon" aria-hidden="true" /> OnePortal</NavLink>
      {tenant && <a className="cr-current" href="#workspace-list-title"><span>{tenant.name}</span><ChevronDown size={14} aria-hidden="true" /></a>}
    </div>
    <nav className="cr-top-nav" aria-label="Điều hướng quản trị">
      {nav.map(([to, label]) => to ? <NavLink key={label} to={to} end>{label}</NavLink> : <span key={label} aria-disabled="true">{label}</span>)}
    </nav>
    <div className="cr-top-actions">
      <div className="cr-search">
        <Field label="Tìm công ty" icon={Search} type="search" placeholder="Tên hoặc mã workspace"
          ref={searchInput} value={search} onChange={event => onSearch(event.target.value)} aria-keyshortcuts="Control+K Meta+K" />
        <kbd aria-hidden="true">Ctrl / ⌘ K</kbd>
      </div>
      <button type="button" className="portal-secondary" onClick={onCreate}><Plus className="tenant-icon" aria-hidden="true" /> Tạo công ty</button>
      <button type="button" className="portal-secondary" aria-label="Thoát quản trị" title="Đăng xuất" onClick={onLogout}><LogOut className="tenant-icon" aria-hidden="true" /></button>
    </div>
  </header>;
}
