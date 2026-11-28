import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { workspaceBasename } from './utils/tenantScope';
import '@oneportal/uiverse-ui/styles.css';
import './index.css';
import './studio.css';
import './stride.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={workspaceBasename()}><App /></BrowserRouter>
  </StrictMode>,
);
