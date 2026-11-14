import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '@astryxdesign/core/AppShell';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import { NavIcon } from '@astryxdesign/core/NavIcon';
import { Icon } from '@astryxdesign/core/Icon';
import { Divider } from '@astryxdesign/core/Divider';
import { Badge } from '@astryxdesign/core/Badge';
import { ToastViewport } from '@astryxdesign/core/Toast';
import {
  ViewColumnsIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  CubeIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  BuildingStorefrontIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import PageSkeleton from '../components/common/PageSkeleton';

const MENU_SECTIONS = [
  {
    title: 'Nghiệp vụ',
    items: [
      { label: 'Tổng quan', path: '/', icon: ChartBarIcon },
      { label: 'Báo giá', path: '/quotations', icon: DocumentTextIcon },
      { label: 'Tạo báo giá', path: '/quotations/create', icon: PlusCircleIcon },
    ],
  },
  {
    title: 'Danh mục',
    items: [
      { label: 'Nhóm sản phẩm', path: '/product-groups', icon: ViewColumnsIcon },
      { label: 'Danh mục sản phẩm', path: '/products', icon: CubeIcon },
      { label: 'Khách hàng', path: '/customers', icon: UserGroupIcon },
    ],
  },
  {
    title: 'Cấu hình',
    items: [
      { label: 'Mẫu báo giá', path: '/templates', icon: Cog6ToothIcon },
      { label: 'Thành viên workspace', path: '/members', icon: UserGroupIcon, adminOnly: true },
    ],
  },
  {
    title: 'Hỗ trợ',
    items: [
      { label: 'Gửi yêu cầu hỗ trợ', path: '/contact', icon: QuestionMarkCircleIcon },
      { label: 'Xử lý hỗ trợ', path: '/support', icon: ViewColumnsIcon, adminOnly: true },
    ],
  },
];

export default function QuotingLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isPathActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/quotations') {
      return (
        location.pathname === '/quotations' ||
        (location.pathname.startsWith('/quotations/') &&
          !location.pathname.startsWith('/quotations/create'))
      );
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <AppShell
      contentPadding={0}
      height="auto"
      mobileNav={{ breakpoint: 'lg' }}
      sideNav={
        <SideNav
          collapsible
          resizable={{ defaultWidth: 260, minWidth: 220, maxWidth: 360 }}
          header={
            <SideNavHeading
              heading="Quoting"
              icon={<NavIcon icon={<Icon icon={BuildingStorefrontIcon} size="sm" />} />}
              headingHref="/"
            />
          }
          footer={
            <SideNavSection title="Tài khoản" isHeaderHidden>
              <SideNavItem
                label={user?.fullName || user?.email || 'Người dùng'}
                icon={UserCircleIcon}
                endContent={
                  <Badge label={isAdmin ? 'Admin' : 'NV'} variant={isAdmin ? 'blue' : 'neutral'} />
                }
              />
              <SideNavItem
                label="Đăng xuất"
                icon={ArrowRightOnRectangleIcon}
                onClick={handleLogout}
              />
            </SideNavSection>
          }
        >
          {MENU_SECTIONS.map((section, idx) => (
            <React.Fragment key={section.title}>
              {idx > 0 && <Divider />}
              <SideNavSection title={section.title}>
                {section.items.filter((item) => !item.adminOnly || isAdmin).map((item) => (
                  <SideNavItem
                    key={item.path}
                    label={item.label}
                    icon={item.icon}
                    isSelected={isPathActive(item.path)}
                    onClick={() => navigate(item.path)}
                  />
                ))}
              </SideNavSection>
            </React.Fragment>
          ))}
        </SideNav>
      }
    >
      <div className="quoting-content">
        <ToastViewport position="topEnd" />
        <div className="quoting-toolbar"><ThemeToggle /></div>
        <React.Suspense fallback={<PageSkeleton />}><Outlet /></React.Suspense>
      </div>
    </AppShell>
  );
}
