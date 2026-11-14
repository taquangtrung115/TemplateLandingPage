import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import TemplatesPage from '../pages/TemplatesPage';
import ProductsPage from '../pages/ProductsPage';
import CustomizerPage from '../pages/CustomizerPage';
import LivePreviewPage from '../pages/LivePreviewPage';
import PublicLandingPage from '../pages/PublicLandingPage';
import MyCustomizationsPage from '../pages/MyCustomizationsPage';
import DraftsPage from '../pages/DraftsPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminTemplatesPage from '../pages/admin/AdminTemplatesPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminMenusPage from '../pages/admin/AdminMenusPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminSitesPage from '../pages/admin/AdminSitesPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/preview/:templateId" element={<LivePreviewPage />} />
      <Route path="/view/:slug" element={<LivePreviewPage />} />
      <Route path="/p/:slug" element={<PublicLandingPage />} />
      <Route path="/p/:slug/v/:versionNumber" element={<PublicLandingPage />} />
      <Route path="/live/:slug" element={<PublicLandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/drafts" element={<DraftsPage />} />

      {/* Local drafts are available to guests; server working drafts require an account. */}
      <Route path="/customize/draft/:draftId" element={<CustomizerPage />} />
      <Route path="/customize/:templateId" element={<CustomizerPage />} />
      <Route
        path="/customize/:templateId/:customizationId"
        element={
          <ProtectedRoute>
            <CustomizerPage />
          </ProtectedRoute>
        }
      />

      {/* User Protected Pages */}
      <Route
        path="/my-sites"
        element={
          <ProtectedRoute>
            <MyCustomizationsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Pages */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="templates" element={<AdminTemplatesPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="menus" element={<AdminMenusPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="sites" element={<AdminSitesPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
