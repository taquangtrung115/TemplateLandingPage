import { useState } from 'react';
import { ArrowUpRight, CircleAlert, CircleCheck, CircleMinus, LoaderCircle, PackagePlus, RotateCcw, Settings, Store } from 'lucide-react';
import { UiverseButton, UiverseIconLabel as IconLabel } from '@oneportal/uiverse-ui';
import { applications, getPortalAdminUrl } from '../applications';

export default function AppStore({ tenant, loading, appKey, full, onSelect, onInstall, onConfigure, onUninstall }) {
  const [installing, setInstalling] = useState(null);

  async function install(appKey, allowSelfRegistration) {
    if (loading || installing) return;
    setInstalling(appKey);
    try { await onInstall(appKey, allowSelfRegistration); }
    finally { setInstalling(null); }
  }

  return <div>
    <h2 className="store-title"><IconLabel icon={Store}>{full ? 'Store ứng dụng' : 'Ứng dụng của workspace'}</IconLabel></h2>
    <div className="app-matrix" aria-label="Ứng dụng">
      {applications.map(app => {
        const record = tenant.applications.find(item => item.appKey === app.key);
        const ready = record?.isEnabled && record.provisioningStatus === 'Ready';
        const failed = record?.provisioningStatus === 'Failed';
        const title = ready ? 'Sẵn sàng' : failed ? 'Khởi tạo thất bại' : record?.isEnabled ? 'Đang khởi tạo' : 'Chưa cài';
        const Icon = app.icon;
        const StatusIcon = ready ? CircleCheck : failed ? CircleAlert : record?.isEnabled ? LoaderCircle : CircleMinus;
        const href = getPortalAdminUrl(tenant.key, app.key);
        const pending = installing === app.key;
        const InstallIcon = failed ? RotateCcw : PackagePlus;
        const tone = ready ? 'ready' : failed ? 'failed' : record?.isEnabled ? 'waiting' : '';
        return <article key={app.key} className="store-app">
          <div className="store-app-context">
            <button className="matrix-app" type="button" aria-pressed={app.key === appKey} onClick={() => onSelect(app.key)}>
              <span className="store-icon"><Icon size={17} aria-hidden="true" /></span>
              <span>{app.name}</span>
            </button>
            {full && <p>{app.description}</p>}
          </div>
          <span className={'status ' + tone}><IconLabel icon={StatusIcon}>{title}</IconLabel></span>
          <div className="store-actions">
            {!record?.isEnabled || failed ? <UiverseButton size="small" disabled={!tenant.isActive || loading || !!installing}
              isLoading={pending} icon={<InstallIcon className="tenant-icon" aria-hidden="true" />}
              onClick={() => install(app.key, record?.allowSelfRegistration ?? false)}>
              {pending ? 'Đang cài…' : failed ? 'Thử khởi tạo lại' : 'Cài ứng dụng'}
            </UiverseButton>
              : <UiverseButton size="small" variant="outline" disabled={loading} aria-label={'Cấu hình ' + app.name} onClick={() => onConfigure(app.key)}><IconLabel icon={Settings}>Cấu hình</IconLabel></UiverseButton>}
            {ready && tenant.isActive && href && <a className="uv-button uv-button--outline uv-button--small" href={href} target="_blank" rel="noreferrer"><IconLabel icon={ArrowUpRight}>Mở quản trị</IconLabel></a>}
            {record?.isEnabled && full && <UiverseButton size="small" variant="outline" className="danger-text" disabled={loading}
              onClick={() => onUninstall(app.key)}>Gỡ cài đặt</UiverseButton>}
          </div>
        </article>;
      })}
    </div>
  </div>;
}
