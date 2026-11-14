import WorkspaceGate from './components/WorkspaceGate';
import { workspaceBasename } from './utils/tenantScope';
import './layers.css';
import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { InternationalizationProvider } from '@astryxdesign/core/i18n';
import vietnameseMessages from '@astryxdesign/core/locales/vi-VN.json';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <InternationalizationProvider locale="vi-VN" messages={{ 'vi-VN': vietnameseMessages }}><ThemeProvider>
      <BrowserRouter basename={workspaceBasename()}>
        <AuthProvider>
          <WorkspaceGate><AppRoutes /></WorkspaceGate>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider></InternationalizationProvider>
  </React.StrictMode>
);
