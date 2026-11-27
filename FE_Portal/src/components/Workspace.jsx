import React, { useCallback, useEffect, useState } from 'react';
import { Applications } from '../applications';
import { AdminPath, PlatformPath, isAdminPath, storefrontLocation, workspacePath } from '../routes/portal-routes';
import { getWorkspaceApplications } from '../services/workspace-service';
import ApplicationFrame from './ApplicationFrame';
import PortalLink from './PortalLink';

export default function Workspace({ route, navigate, syncEmbeddedPath }) {
  // #region Workspace applications
  const { tenantKey, appKey, subpath, suffix } = route;
  const [installation, setInstallation] = useState(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getWorkspaceApplications(tenantKey, controller.signal).then(value => {
      if (!controller.signal.aborted) setInstallation(value);
    }).catch(error => {
      if (!controller.signal.aborted) setError(error.message);
    });
    return () => controller.abort();
  }, [tenantKey, revision]);

  const installedApps = Applications.filter(app => installation?.appKeys.includes(app.key));
  const selectedApp = installedApps.find(app => app.key === appKey);
  const autoOpenApp = !appKey && installedApps.length === 1 ? installedApps[0] : null;

  useEffect(() => {
    if (autoOpenApp) navigate(workspacePath(tenantKey, autoOpenApp.key, AdminPath, suffix), { replace: true });
  }, [autoOpenApp, navigate, suffix, tenantKey]);

  const handleEmbeddedRoute = useCallback(location => {
    const path = new URL(location.url).pathname.slice(('/t/' + location.tenantKey).length);
    if (!isAdminPath(path)) return;
    if (location.tenantKey !== tenantKey) {
      navigate(location.portalPath, { replace: true });
      return;
    }
    // The iframe already navigated. Update the shareable URL without reloading it.
    syncEmbeddedPath(location.portalPath);
  }, [navigate, syncEmbeddedPath, tenantKey]);

  const publicUrl = subpath && !isAdminPath(subpath) && selectedApp?.origin
    ? storefrontLocation(selectedApp.origin, tenantKey, selectedApp.key, subpath, suffix) : null;
  useEffect(() => {
    if (publicUrl) window.location.replace(publicUrl);
  }, [publicUrl]);
  // #endregion

  function handleRetry() {
    setError('');
    setRevision(value => value + 1);
  }

  if (error) return (
    <div className="portal-state">
      <p role="alert">{error}</p>
      <button type="button" onClick={handleRetry}>Thử lại</button>
    </div>
  );
  if (!installation || autoOpenApp) return <p className="portal-state" role="status">Đang tải ứng dụng của workspace…</p>;

  if (publicUrl) return <div className="portal-state"><a href={publicUrl}>Mở trang riêng của {selectedApp.name}</a></div>;

  const framePath = workspacePath(tenantKey, null, subpath || AdminPath, suffix);
  const src = selectedApp?.origin ? new URL(framePath, selectedApp.origin).href : null;

  return (
    <section className="portal-workspace" aria-label={installation.tenantName}>
      <header className="workspace-bar">
        <div className="workspace-identity">
          <strong>{installation.tenantName}</strong>
          <span>{tenantKey}</span>
        </div>
        {selectedApp && <nav className="workspace-apps" aria-label="Ứng dụng của workspace">
          {installedApps.map(app => (
            <PortalLink key={app.key} href={workspacePath(tenantKey, app.key, AdminPath)} navigate={navigate} aria-current={app === selectedApp ? 'page' : undefined}>
              {app.name}
            </PortalLink>
          ))}
        </nav>}
        <PortalLink className="uv-button uv-button--outline uv-button--small" href={PlatformPath + '?view=store&tenant=' + encodeURIComponent(tenantKey)} navigate={navigate}>Store</PortalLink>
      </header>

      {selectedApp ? (
        <ApplicationFrame key={`${selectedApp.key}:${src}`} app={selectedApp} src={src} onRouteChange={handleEmbeddedRoute} />
      ) : (
        <div className="portal-state">
          {appKey && <p role="alert">Ứng dụng này chưa khả dụng trong workspace.</p>}
          {installedApps.length ? (
            <div className="app-list">
              <h1>Chọn ứng dụng</h1>
              {installedApps.map(app => (
                <PortalLink key={app.key} className="app-option" href={workspacePath(tenantKey, app.key, AdminPath)} navigate={navigate}>
                  <strong>{app.name}</strong>
                  <span>{app.description}</span>
                </PortalLink>
              ))}
            </div>
          ) : (
            <p>Workspace chưa có ứng dụng sẵn sàng.</p>
          )}
        </div>
      )}
    </section>
  );
}
