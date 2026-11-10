import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@astryxdesign/core/Spinner';
import { useAuth } from '../contexts/AuthContext';
import QuotingLayout from '../layouts/QuotingLayout';
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const QuotationListPage = lazy(() => import('../pages/quotations/QuotationListPage'));
const CreateQuotationPage = lazy(() => import('../pages/quotations/CreateQuotationPage'));
const QuotationDetailPage = lazy(() => import('../pages/quotations/QuotationDetailPage'));
const ProductCatalogPage = lazy(() => import('../pages/products/ProductCatalogPage'));
const ProductGroupPage = lazy(() => import('../pages/products/ProductGroupPage'));
const CustomerListPage = lazy(() => import('../pages/customers/CustomerListPage'));
const TemplateListPage = lazy(() => import('../pages/templates/TemplateListPage'));
const SupportBoardPage = lazy(() => import('../pages/support/SupportBoardPage'));
const ContactPage = lazy(() => import('../pages/contact/ContactPage'));

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background-body)',
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Spinner label="Đang tải trang" />}><Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <QuotingLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="quotations" element={<QuotationListPage />} />
        <Route path="quotations/create" element={<CreateQuotationPage />} />
        <Route path="quotations/:id/edit" element={<CreateQuotationPage />} />
        <Route path="quotations/:id" element={<QuotationDetailPage />} />
        <Route path="product-groups" element={<ProductGroupPage />} />
        <Route path="products" element={<ProductCatalogPage />} />
        <Route path="customers" element={<CustomerListPage />} />
        <Route path="templates" element={<TemplateListPage />} />
        <Route path="support" element={<SupportBoardPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></Suspense>
  );
}
