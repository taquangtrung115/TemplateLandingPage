import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutTemplate, ShieldCheck, Heart, User, LogOut, LogIn, Menu, X } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
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
                Template Builder
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                isActive('/') ? 'text-rose-600 bg-rose-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Trang Chủ
            </Link>

            <Link
              to="/templates"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                isActive('/templates') ? 'text-rose-600 bg-rose-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>Kho Mẫu Thiệp</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-sites"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive('/my-sites') ? 'text-rose-600 bg-rose-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Thiệp Của Tôi</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  location.pathname.startsWith('/admin') ? 'text-rose-600 bg-rose-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <span>Quản Trị</span>
              </Link>
            )}
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

                {/* Dropdown Menu */}
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

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Trang Chủ
          </Link>
          <Link
            to="/templates"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Kho Mẫu Thiệp
          </Link>
          {isAuthenticated && (
            <Link
              to="/my-sites"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Thiệp Của Tôi
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
            >
              Trang Quản Trị
            </Link>
          )}

          <div className="pt-3 border-t border-gray-100">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất ({user?.fullName})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
