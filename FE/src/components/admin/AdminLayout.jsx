import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Layers, Users, Home, LogOut, ShieldCheck } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', end: true, label: 'Bảng Thống Kê', icon: LayoutDashboard },
    { to: '/admin/templates', end: false, label: 'Quản Lý Mẫu (Master)', icon: Layers },
    { to: '/admin/users', end: false, label: 'Quản Lý Người Dùng', icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Brand header */}
          <div className="h-16 px-6 border-b border-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold">
              M
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-wide block">MotionAdmin</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Quản Trị Hệ Thống
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="md:hidden flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">MotionAdmin</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right">
              <span className="text-xs font-bold text-gray-900 block">{user?.fullName || 'Admin'}</span>
              <span className="text-[10px] text-gray-500">{user?.email}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-sm">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Main nested route content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
