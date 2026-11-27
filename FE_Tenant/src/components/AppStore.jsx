import { useState } from 'react';
import { ArrowUpRight, CircleAlert, CircleCheck, CircleMinus, LoaderCircle, PackagePlus, RotateCcw, Settings, Store } from 'lucide-react';
import { UiverseBadge, UiverseButton, UiverseCard, UiverseIconLabel as IconLabel } from '@oneportal/uiverse-ui';
import { applications, getPortalAdminUrl } from '../applications';

export default function AppStore({ tenant, loading, onInstall, onConfigure }) {
  const [installing, setInstalling] = useState(null);

  async function install(appKey, allowSelfRegistration) {
    if (loading || installing) return;
    setInstalling(appKey);
    try { await onInstall(appKey, allowSelfRegistration); }
    finally { setInstalling(null); }
  }

  return <section aria-labelledby="store-title">
    <h3 id="store-title" className="store-title"><IconLabel icon={Store}>Store ứng dụng</IconLabel></h3>
    <div className="store-grid">
      {applications.map(app => {
        const record = tenant.applications.find(item => item.appKey === app.key);
        const ready = record?.isEnabled && record.provisioningStatus === 'Ready';
        const failed = record?.provisioningStatus === 'Failed';
        const title = ready ? 'Đã cài' : failed ? 'Khởi tạo thất bại' : record?.isEnabled ? 'Đang khởi tạo' : 'Chưa cài';
        const Icon = app.icon;
        const StatusIcon = ready ? CircleCheck : failed ? CircleAlert : record?.isEnabled ? LoaderCircle : CircleMinus;
        const href = getPortalAdminUrl(tenant.key, app.key);
        const pending = installing === app.key;
        const InstallIcon = failed ? RotateCcw : PackagePlus;
        return <UiverseCard key={app.key} className="store-app">
          <div className="store-app-header">
            <span className="store-icon"><Icon size={20} aria-hidden="true" /></span>
            <UiverseBadge tone={ready ? 'emerald' : failed ? 'rose' : 'neutral'}><IconLabel icon={StatusIcon}>{title}</IconLabel></UiverseBadge>
          </div>
          <div><h4>{app.name}</h4><p>{app.description}</p></div>
          <div className="store-actions">
            {!record?.isEnabled || failed ? <UiverseButton size="small" disabled={!tenant.isActive || loading || !!installing}
              isLoading={pending} icon={<InstallIcon className="tenant-icon" aria-hidden="true" />}
              onClick={() => install(app.key, record?.allowSelfRegistration ?? false)}>
              {pending ? 'Đang cài…' : failed ? 'Thử khởi tạo lại' : 'Cài ứng dụng'}
            </UiverseButton>
              : <UiverseButton size="small" variant="outline" disabled={loading} onClick={() => onConfigure(app.key)}><IconLabel icon={Settings}>Cấu hình</IconLabel></UiverseButton>}
            {ready && tenant.isActive && href && <a className="uv-button uv-button--outline uv-button--small" href={href} target="_blank" rel="noreferrer"><IconLabel icon={ArrowUpRight}>Mở quản trị</IconLabel></a>}
          </div>
        </UiverseCard>;
      })}
    </div>
  </section>;
}
