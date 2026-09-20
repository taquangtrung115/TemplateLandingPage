import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';

function AppContent() {
  const location = useLocation();

  // Hide Navbar and Footer on full-bleed / dedicated viewports
  const isCustomizer = location.pathname.startsWith('/customize');
  const isLivePreview = location.pathname.startsWith('/preview') || location.pathname.startsWith('/view');
  const isAdminArea = location.pathname.startsWith('/admin');

  const hideHeaderFooter = isCustomizer || isLivePreview || isAdminArea;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {!hideHeaderFooter && <Navbar />}
      <main className="flex-1 flex flex-col w-full">
        <AppRoutes />
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
