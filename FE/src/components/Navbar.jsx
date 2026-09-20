import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  LayoutTemplate,
  ShieldCheck,
  Heart,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import navigationMenuApi from '../api/navigationMenuApi';
import { resolveIcon } from '../utils/iconResolver';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [menus, setMenus] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({}); // for mobile accordion { [menuId]: boolean }
  const [activeDropdown, setActiveDropdown] = useState(null); // for desktop hover { [menuId]: boolean }

  useEffect(() => {
    let isMounted = true;
    const loadMenus = async () => {
      try {
        const data = await navigationMenuApi.getMenus({ isActiveOnly: true });
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setMenus(data);
        }
      } catch {
        // Fallback default navigation if api fails or is empty
      }
    };
    loadMenus();
    return () => {
      isMounted = false;
    };
  }, []);

  const isActive = (path) => {
    if (!path || path.startsWith('#')) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const toggleMobileSubmenu = (menuId) => {
    setOpenSubmenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const getBadgeStyle = (color) => {
    switch (color?.toLowerCase()) {
      case 'rose':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'blue':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'purple':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'amber':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isExternal = (url) => /^https?:\/\//i.test(url);

  // Fallback menus if database has no menus yet
  const fallbackMenus = [
    { id: 'home', title: 'Trang Chủ', url: '/', icon: 'Home' },
    {
      id: 'templates',
      title: 'Kho Mẫu Thiệp',
      url: '/templates',
      icon: 'LayoutTemplate',
      badge: 'HOT',
      badgeColor: 'rose',
      subMenus: [
        { id: 'w', title: 'Thiệp Cưới', url: '/templates?category=wedding', icon: 'Heart', badge: 'HOT', badgeColor: 'rose' },
        { id: 'e', title: 'Lễ Đính Hôn', url: '/templates?category=engagement', icon: 'Ring' },
        { id: 'b', title: 'Thiệp Sinh Nhật', url: '/templates?category=birthday', icon: 'Cake', badge: 'NEW', badgeColor: 'blue' },
        { id: 'a', title: 'Kỷ Niệm Ngày Cưới', url: '/templates?category=anniversary', icon: 'Sparkles' },
        { id: 'bs', title: 'Thôi Nôi & Đầy Tháng', url: '/templates?category=baby-shower', icon: 'Baby' },
      ],
    },
    { id: 'pricing', title: 'Bảng Giá', url: '/#pricing', icon: 'BadgePercent' },
    { id: 'guide', title: 'Hướng Dẫn', url: '/#guide', icon: 'BookOpen' },
  ];

  const displayedMenus = menus.length > 0 ? menus : fallbackMenus;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-gray-100/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Motion<span className="text-rose-600">Sites</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold -mt-1">
                Cinelove Template Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {displayedMenus.map((menu) => {
              const IconComp = resolveIcon(menu.icon, Sparkles);
              const hasChildren = menu.subMenus && menu.subMenus.length > 0;
              const active = isActive(menu.url);

              if (hasChildren) {
                return (
                  <div
                    key={menu.id}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(menu.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        active || activeDropdown === menu.id
                          ? 'text-rose-600 bg-rose-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{menu.title}</span>
                      {menu.badge && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border uppercase ${getBadgeStyle(
                            menu.badgeColor
                          )}`}
                        >
                          {menu.badge}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          activeDropdown === menu.id ? 'rotate-180 text-rose-600' : 'text-gray-400'
                        }`}
                      />
                    </button>

                    {/* Desktop Dropdown */}
                    {activeDropdown === menu.id && (
                      <div className="absolute left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        {menu.subMenus.map((sub) => {
                          const SubIcon = resolveIcon(sub.icon, Sparkles);
                          const subExternal = isExternal(sub.url);

                          const content = (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-100 transition-colors">
                                  <SubIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-semibold text-xs text-gray-700 group-hover:text-rose-600 transition-colors">
                                  {sub.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {sub.badge && (
                                  <span
                                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border uppercase ${getBadgeStyle(
                                      sub.badgeColor
                                    )}`}
                                  >
                                    {sub.badge}
                                  </span>
                                )}
                                {subExternal && <ExternalLink className="w-3 h-3 text-gray-400" />}
                              </div>
                            </div>
                          );

                          return subExternal ? (
                            <a
                              key={sub.id}
                              href={sub.url}
                              target={sub.target || '_blank'}
                              rel="noopener noreferrer"
                              className="group flex items-center px-3 py-2 rounded-xl hover:bg-rose-50/50 transition-colors"
                            >
                              {content}
                            </a>
                          ) : (
                            <Link
                              key={sub.id}
                              to={sub.url}
                              target={sub.target || '_self'}
                              className="group flex items-center px-3 py-2 rounded-xl hover:bg-rose-50/50 transition-colors"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {content}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return isExternal(menu.url) ? (
                <a
                  key={menu.id}
                  href={menu.url}
                  target={menu.target || '_self'}
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{menu.title}</span>
                  {menu.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border uppercase ${getBadgeStyle(
                        menu.badgeColor
                      )}`}
                    >
                      {menu.badge}
                    </span>
                  )}
                </a>
              ) : (
                <Link
                  key={menu.id}
                  to={menu.url}
                  target={menu.target || '_self'}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    active ? 'text-rose-600 bg-rose-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{menu.title}</span>
                  {menu.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border uppercase ${getBadgeStyle(
                        menu.badgeColor
                      )}`}
                    >
                      {menu.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {isAuthenticated && (
              <Link
                to="/my-sites"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  location.pathname === '/my-sites' ? 'text-rose-600 bg-rose-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Thiệp Của Tôi</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                <span>Quản Trị</span>
              </Link>
            )}

            {/* Desktop Menu bordered black button */}
            <Link
              to="/templates"
              aria-label="Menu"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black text-black text-xs font-bold hover:bg-black hover:text-white transition-all shadow-sm"
            >
              <span>Menu</span>
            </Link>
          </nav>

          {/* User Profile / Auth buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center border border-rose-200">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-bold text-gray-700 max-w-[120px] truncate">
                    {user?.fullName || 'Tài khoản'}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <span className="block text-xs font-bold text-gray-900">{user?.fullName}</span>
                      <span className="block text-[10px] text-gray-400 truncate">{user?.email}</span>
                    </div>
                    <Link
                      to="/my-sites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>Thiệp đã tạo</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Bảng quản trị</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left border-t border-gray-100 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md shadow-rose-500/20 hover:bg-rose-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button with 3 spans cubic-bezier X-morph */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl hover:bg-gray-100 focus:outline-none transition-colors"
            >
              <span
                className={`w-6 h-0.5 bg-gray-900 rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] transform ${
                  mobileMenuOpen ? 'translate-y-2 rotate-45' : ''
                }`}
              />
              <span
                className={`w-6 h-0.5 bg-gray-900 rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] transform ${
                  mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                }`}
              />
              <span
                className={`w-6 h-0.5 bg-gray-900 rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] transform ${
                  mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-gray-900">
              Motion<span className="text-rose-600">Sites</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Menu Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 no-scrollbar">
          {displayedMenus.map((menu, idx) => {
            const IconComp = resolveIcon(menu.icon, Sparkles);
            const hasChildren = menu.subMenus && menu.subMenus.length > 0;
            const isSubOpen = !!openSubmenus[menu.id];
            const itemStyle = {
              transitionDelay: `${100 + idx * 60}ms`,
            };

            if (hasChildren) {
              return (
                <div
                  key={menu.id}
                  style={itemStyle}
                  className={`border-b border-gray-50 pb-1 transition-all duration-300 transform ${
                    mobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                  }`}
                >
                  <button
                    onClick={() => toggleMobileSubmenu(menu.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-gray-800 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <IconComp className="w-4 h-4 text-rose-500" />
                      <span>{menu.title}</span>
                      {menu.badge && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border uppercase ${getBadgeStyle(
                            menu.badgeColor
                          )}`}
                        >
                          {menu.badge}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isSubOpen ? 'rotate-180 text-rose-600' : ''
                      }`}
                    />
                  </button>

                  {isSubOpen && (
                    <div className="pl-6 pr-2 py-1 space-y-1 bg-gray-50/50 rounded-xl mt-1">
                      {menu.subMenus.map((sub) => {
                        const SubIcon = resolveIcon(sub.icon, Sparkles);
                        return isExternal(sub.url) ? (
                          <a
                            key={sub.id}
                            href={sub.url}
                            target={sub.target || '_blank'}
                            rel="noopener noreferrer"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:text-rose-600"
                          >
                            <div className="flex items-center gap-2">
                              <SubIcon className="w-3.5 h-3.5 text-rose-400" />
                              <span>{sub.title}</span>
                            </div>
                            {sub.badge && (
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border uppercase ${getBadgeStyle(
                                  sub.badgeColor
                                )}`}
                              >
                                {sub.badge}
                              </span>
                            )}
                          </a>
                        ) : (
                          <Link
                            key={sub.id}
                            to={sub.url}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:text-rose-600"
                          >
                            <div className="flex items-center gap-2">
                              <SubIcon className="w-3.5 h-3.5 text-rose-400" />
                              <span>{sub.title}</span>
                            </div>
                            {sub.badge && (
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border uppercase ${getBadgeStyle(
                                  sub.badgeColor
                                )}`}
                              >
                                {sub.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return isExternal(menu.url) ? (
              <a
                key={menu.id}
                href={menu.url}
                target={menu.target || '_self'}
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                style={itemStyle}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300 transform ${
                  mobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconComp className="w-4 h-4 text-rose-500" />
                  <span>{menu.title}</span>
                </div>
                {menu.badge && (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border uppercase ${getBadgeStyle(
                      menu.badgeColor
                    )}`}
                  >
                    {menu.badge}
                  </span>
                )}
              </a>
            ) : (
              <Link
                key={menu.id}
                to={menu.url}
                onClick={() => setMobileMenuOpen(false)}
                style={itemStyle}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300 transform ${
                  mobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconComp className="w-4 h-4 text-rose-500" />
                  <span>{menu.title}</span>
                </div>
                {menu.badge && (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border uppercase ${getBadgeStyle(
                      menu.badgeColor
                    )}`}
                  >
                    {menu.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {isAuthenticated && (
            <Link
              to="/my-sites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Thiệp Của Tôi</span>
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Trang Quản Trị</span>
            </Link>
          )}
        </div>

        {/* Drawer Footer / Auth */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/70">
          {isAuthenticated ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất ({user?.fullName})</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md shadow-rose-500/20 hover:bg-rose-700"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
