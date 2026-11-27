import { Aperture, ArrowUpRight, FileText, LayoutTemplate } from 'lucide-react';
import { UiverseBadge, UiverseButton, UiverseCard } from '@oneportal/uiverse-ui';
import { applications, getPortalAdminUrl } from '../applications';

const appIcons = { quoting: FileText, landing: LayoutTemplate, photoprint: Aperture };

export default function AppStore({ tenant, loading, onInstall, onConfigure }) {
  return <section aria-labelledby="store-title">
    <h3 id="store-title" className="store-title">Store ứng dụng</h3>
    <div className="store-grid">
      {applications.map(app => {
        const record = tenant.applications.find(item => item.appKey === app.key);
        const ready = record?.isEnabled && record.provisioningStatus === 'Ready';
        const failed = record?.provisioningStatus === 'Failed';
        const title = ready ? 'Đã cài' : failed ? 'Khởi tạo thất bại' : record?.isEnabled ? 'Đang khởi tạo' : 'Chưa cài';
        const Icon = appIcons[app.key];
        const href = getPortalAdminUrl(tenant.key, app.key);
        return <UiverseCard key={app.key} className="store-app">
          <div className="store-app-header"><span className="store-icon"><Icon size={20} /></span><UiverseBadge tone={ready ? 'emerald' : failed ? 'rose' : 'neutral'}>{title}</UiverseBadge></div>
          <div><h4>{app.name}</h4><p>{app.description}</p></div>
          <div className="store-actions">
            {!record?.isEnabled || failed ? <UiverseButton size="small" disabled={!tenant.isActive || loading}
              onClick={() => onInstall(app.key, record?.allowSelfRegistration ?? false)}>{failed ? 'Thử khởi tạo lại' : 'Cài ứng dụng'}</UiverseButton>
              : <UiverseButton size="small" variant="outline" disabled={loading} onClick={() => onConfigure(app.key)}>Cấu hình</UiverseButton>}
            {ready && tenant.isActive && href && <a className="uv-button uv-button--outline uv-button--small" href={href} target="_blank" rel="noreferrer">Mở quản trị <ArrowUpRight size={14} /></a>}
          </div>
        </UiverseCard>;
      })}
    </div>
  </section>;
}
