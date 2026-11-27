import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { UiverseLoader } from '@oneportal/uiverse-ui';
import StorefrontLayout from '../layouts/StorefrontLayout';
import AdminLayout from '../layouts/AdminLayout';
import WorkspaceGate from '../components/common/WorkspaceGate';
import HomePage from '../pages/HomePage';
import { notifyPortalNavigation } from '../utils/portalNavigation';
import { paths } from './paths';

const ServicesPage = lazy(() => import('../pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('../pages/ServiceDetailPage'));
const DemoStudioPage = lazy(() => import('../pages/DemoStudioPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const OrderTrackingPage = lazy(() => import('../pages/OrderTrackingPage'));
const SupportPage = lazy(() => import('../pages/SupportPage'));
const CredentialsPage = lazy(() => import('../pages/auth/CredentialsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminCatalogPage = lazy(() => import('../pages/admin/AdminCatalogPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminSupportBoardPage = lazy(() => import('../pages/admin/AdminSupportBoardPage'));
const AdminContactSettingsPage = lazy(() => import('../pages/admin/AdminContactSettingsPage'));
const AdminWorkspacePage = lazy(() => import('../pages/admin/AdminWorkspacePage'));

export default function AppRoutes() {
  const location = useLocation();
  useEffect(() => {
    if (/^\/admin(?:\/|$)/.test(location.pathname)) notifyPortalNavigation();
    if (!location.hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, location.search, location.hash]);
  return <Suspense fallback={<div className="shell page-section"><UiverseLoader /></div>}>
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route path={paths.home} element={<HomePage />} />
        <Route path={paths.services} element={<ServicesPage />} />
        <Route path={paths.services + '/:slug'} element={<ServiceDetailPage />} />
        <Route path={paths.demo} element={<DemoStudioPage />} />
        <Route path={paths.cart} element={<CartPage />} />
        <Route path={paths.checkout} element={<CheckoutPage />} />
        <Route path={paths.trackOrder} element={<OrderTrackingPage />} />
        <Route path={paths.support} element={<SupportPage />} />
        <Route path={paths.login} element={<CredentialsPage key="login" />} />
        <Route path={paths.register} element={<CredentialsPage key="register" register />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route element={<WorkspaceGate />}>
        <Route element={<AdminLayout />}>
          <Route path={paths.admin} element={<AdminDashboardPage />} />
          <Route path={paths.adminServices} element={<AdminCatalogPage key="products" kind="products" />} />
          <Route path={paths.adminDemos} element={<AdminCatalogPage key="demos" kind="demos" />} />
          <Route path={paths.adminOrders} element={<AdminOrdersPage />} />
          <Route path={paths.adminSupport} element={<AdminSupportBoardPage />} />
          <Route path={paths.adminSettings} element={<AdminContactSettingsPage />} />
          <Route path={paths.adminMembers} element={<AdminWorkspacePage key="members" />} />
          <Route path={paths.adminRegistration} element={<AdminWorkspacePage key="registration" registration />} />
        </Route>
      </Route>
    </Routes>
  </Suspense>;
}
