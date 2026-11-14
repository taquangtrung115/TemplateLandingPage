import WorkspaceMembers from '../components/WorkspaceMembers';
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLoading from '../components/common/AppLoading';
import { useAuth } from '../contexts/AuthContext';
import QuotingLayout from '../layouts/QuotingLayout';
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const AdminOverviewPage = lazy(() => import('../pages/admin/AdminOverviewPage'));
const RegistrationSettingsPage = lazy(() => import('../pages/admin/RegistrationSettingsPage'));
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

  if (loading) return <AppLoading label="Đang kiểm tra phiên đăng nhập" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/" replace/>;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<AppLoading />}><Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<ProtectedRoute><AdminRoute><QuotingLayout admin/></AdminRoute></ProtectedRoute>}>
        <Route index element={<AdminOverviewPage/>}/>
        <Route path="members" element={<WorkspaceMembers/>}/>
        <Route path="registration" element={<RegistrationSettingsPage/>}/>
        <Route path="products" element={<ProductCatalogPage/>}/>
        <Route path="product-groups" element={<ProductGroupPage/>}/>
        <Route path="customers" element={<CustomerListPage/>}/>
        <Route path="templates" element={<TemplateListPage/>}/>
        <Route path="support" element={<SupportBoardPage/>}/>
      </Route>

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
        <Route path="support" element={<AdminRoute><Navigate to="/admin/support" replace/></AdminRoute>} />
        <Route path="members" element={<AdminRoute><Navigate to="/admin/members" replace/></AdminRoute>} />
        <Route path="contact" element={<ContactPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></Suspense>
  );
}
