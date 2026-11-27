import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PlatformApp } from './applications';
import ApplicationFrame from './components/ApplicationFrame';
import PortalLink from './components/PortalLink';
import Workspace from './components/Workspace';
import { UiverseButton, UiverseInput } from '@oneportal/uiverse-ui';
import { PlatformPath, WorkspaceKeyPattern, readPortalRoute, workspacePath } from './routes/portal-routes';

export default function App() {
  // #region Portal navigation
  const [route, setRoute] = useState(() => readPortalRoute(window.location));
  const activeEntry = useRef(window.history.state?.portalEntry);
  const embeddedPaths = useRef(new Map());

  useEffect(() => {
    if (!activeEntry.current) {
      activeEntry.current = crypto.randomUUID();
      window.history.replaceState({ portalEntry: activeEntry.current }, '');
    }

    function handlePopState(event) {
      const entry = event.state?.portalEntry;
      // WebKit can restore the base URL when navigating back across iframe documents.
      const embeddedPath = entry !== activeEntry.current && embeddedPaths.current.get(entry);
      if (embeddedPath) window.history.replaceState(event.state, '', embeddedPath);
      activeEntry.current = entry;
      setRoute(readPortalRoute(window.location));
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path, { replace = false } = {}) => {
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    if (currentPath === path) return;

    const entry = replace && activeEntry.current ? activeEntry.current : crypto.randomUUID();
    if (replace) window.history.replaceState({ portalEntry: entry }, '', path);
    else window.history.pushState({ portalEntry: entry }, '', path);
    activeEntry.current = entry;
    embeddedPaths.current.delete(entry);
    setRoute(readPortalRoute(window.location));
  }, []);

  const syncEmbeddedPath = useCallback(path => {
    embeddedPaths.current.set(activeEntry.current, path);
    window.history.replaceState(window.history.state, '', path);
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    const field = event.currentTarget.elements.namedItem('workspace');
    const key = field.value.trim().toLowerCase();
    if (!WorkspaceKeyPattern.test(key)) {
      field.setCustomValidity('Mã có 2–63 ký tự, bắt đầu bằng chữ hoặc số và có thể chứa dấu gạch ngang.');
      field.reportValidity();
      return;
    }
    navigate(workspacePath(key));
  }
  // #endregion

  return (
    <div className="portal-shell">
      <header className="portal-bar">
        <PortalLink className="portal-brand" href="/" navigate={navigate}>OnePortal</PortalLink>
        <nav aria-label="OnePortal">
          <PortalLink href={PlatformPath} navigate={navigate} aria-current={route.page === 'platform' ? 'page' : undefined}>Quản trị nền tảng</PortalLink>
        </nav>
      </header>
      <main className="portal-main">
        {route.page === 'home' && (
          <section className="portal-state portal-home">
            <h1>Mở workspace</h1>
            <form onSubmit={handleSubmit}>
              <div className="workspace-form-row">
                <UiverseInput label="Mã workspace" id="workspace" name="workspace" required maxLength={63} autoCapitalize="none" spellCheck="false" onInput={event => event.currentTarget.setCustomValidity('')} />
                <UiverseButton type="submit">Mở workspace</UiverseButton>
              </div>
            </form>
          </section>
        )}
        {route.page === 'workspace' && <Workspace key={route.tenantKey} route={route} navigate={navigate} syncEmbeddedPath={syncEmbeddedPath} />}
        {route.page === 'platform' && <ApplicationFrame key={route.search} app={PlatformApp} src={PlatformApp.origin ? PlatformApp.origin + '/' + route.search : null} />}
        {route.page === 'notFound' && (
          <section className="portal-state">
            <h1>Trang không tồn tại</h1>
            <PortalLink href="/" navigate={navigate}>Mở workspace</PortalLink>
          </section>
        )}
      </main>
    </div>
  );
}
