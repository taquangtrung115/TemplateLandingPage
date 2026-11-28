import { Building2, LayoutGrid, LogOut, Plus, Settings, Store, Users } from "lucide-react";

const sections = [
  ["overview", "Tổng quan", LayoutGrid],
  ["tenants", "Công ty", Building2],
  ["members", "Người dùng", Users],
  ["settings", "Cấu hình", Settings],
  ["store", "Store", Store],
];

export default function CommandRail({ section, onSectionChange, hasTenant, onCreate, onLogout }) {
  return <nav className="cr-rail" aria-label="Quản trị nền tảng">
    <span className="cr-mark" aria-label="OnePortal">1P</span>
    <div className="cr-nav-group">
      {sections.map(([key, label, Icon]) => (
        <button type="button" key={key} aria-label={label} title={label} aria-pressed={section === key}
          disabled={!hasTenant && key !== "overview" && key !== "tenants"} onClick={() => onSectionChange(key)}>
          <Icon aria-hidden="true" />
        </button>
      ))}
    </div>
    <button type="button" className="cr-create" aria-label="Thêm công ty" title="Thêm công ty" onClick={onCreate}><Plus aria-hidden="true" /></button>
    <button type="button" className="cr-logout" aria-label="Đăng xuất" title="Đăng xuất" onClick={onLogout}><LogOut aria-hidden="true" /></button>
  </nav>;
}
