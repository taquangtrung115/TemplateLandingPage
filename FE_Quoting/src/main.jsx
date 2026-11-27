import WorkspaceGate from './components/WorkspaceGate';
import { workspaceBasename } from './utils/tenantScope';
import './layers.css';
import './index.css';
import '@oneportal/uiverse-ui/styles.css';

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { InternationalizationProvider } from '@astryxdesign/core/i18n';
import vietnameseMessages from '@astryxdesign/core/locales/vi-VN.json';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { notifyPortalNavigation } from './utils/portalNavigation';

function WorkspaceRoutes() {
  const location = useLocation();
  useEffect(() => { notifyPortalNavigation(); }, [location]);
  return <WorkspaceGate enabled={/^\/(?:admin(?:\/|$)|members\/?$|support\/?$)/.test(location.pathname)}><AppRoutes /></WorkspaceGate>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <InternationalizationProvider locale="vi-VN" messages={{ 'vi-VN': vietnameseMessages }}><ThemeProvider>
      <BrowserRouter basename={workspaceBasename()}>
        <AuthProvider>
          <WorkspaceRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider></InternationalizationProvider>
  </React.StrictMode>
);
