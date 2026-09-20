import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import TemplatesPage from '../pages/TemplatesPage';
import CustomizerPage from '../pages/CustomizerPage';
import LivePreviewPage from '../pages/LivePreviewPage';
import MyCustomizationsPage from '../pages/MyCustomizationsPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminTemplatesPage from '../pages/admin/AdminTemplatesPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminMenusPage from '../pages/admin/AdminMenusPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/preview/:templateId" element={<LivePreviewPage />} />
      <Route path="/view/:slug" element={<LivePreviewPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customizer Pages (Public to allow Guest customization) */}
      <Route path="/customize/:templateId" element={<CustomizerPage />} />
      <Route path="/customize/:templateId/:customizationId" element={<CustomizerPage />} />

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
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
