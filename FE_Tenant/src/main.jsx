import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './styles.css';
import '../tokens.css';
import '@oneportal/uiverse-ui/styles.css';
import './portal.css';
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><AppRoutes /></BrowserRouter></React.StrictMode>);
