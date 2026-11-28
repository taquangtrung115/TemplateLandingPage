import { Building2, LoaderCircle, LockKeyhole, Trash2 } from "lucide-react";
import { UiverseIconLabel as IconLabel } from "@oneportal/uiverse-ui";
import Pagination from "./Pagination";

export default function TenantSwitcher({ tenants, selected, query, listing, page, onSelect, onPageChange, onRemove }) {
  return <section className="cr-directory" aria-labelledby="workspace-list-title">
    <h2 id="workspace-list-title">Danh sách công ty</h2>
    {listing && <p className="muted portal-pending" role="status"><IconLabel icon={LoaderCircle}>Đang tải công ty…</IconLabel></p>}
    <ul className={onRemove ? "cr-switcher cr-tenant-list" : "cr-switcher"} aria-busy={listing}>
      {tenants.map(tenant => {
        const Icon = tenant.isActive ? Building2 : LockKeyhole;
        return <li key={tenant.id}>
          <button type="button" className="tenant-choice" aria-current={selected?.id === tenant.id ? "true" : undefined}
            onClick={() => onSelect(tenant)}>
            <Icon className="tenant-icon" aria-hidden="true" />
            <span>
              <strong>{tenant.name}</strong>
              <code>{tenant.key}</code>
              <small>{tenant.applications.filter(app => app.isEnabled).length} ứng dụng
                {tenant.activeMemberCount != null && " · " + tenant.activeMemberCount + " người dùng"}</small>
            </span>
          </button>
          {onRemove && <button type="button" className="portal-secondary danger-text" aria-label={"Xóa " + tenant.name}
            onClick={() => onRemove(tenant)}><Trash2 className="tenant-icon" aria-hidden="true" /> Xóa</button>}
        </li>;
      })}
    </ul>
    {!tenants.length && !listing && <p className="muted">{query ? "Không tìm thấy công ty phù hợp." : "Chưa có công ty. Thêm công ty để bắt đầu."}</p>}
    {(page > 1 || tenants.length >= 20) && <Pagination page={page} canGoNext={tenants.length >= 20} busy={listing} onChange={onPageChange} />}
  </section>;
}
