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
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider></InternationalizationProvider>
  </React.StrictMode>
);
