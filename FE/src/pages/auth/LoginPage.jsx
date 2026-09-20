import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'Admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-gray-900 tracking-tight">
            Motion<span className="text-rose-600">Sites</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
          Chào Mừng Trở Lại
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-500">
          Đăng nhập để tiếp tục quản lý các trang thiệp mời của bạn
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-gray-200/50 rounded-3xl border border-gray-100">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@template.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo credential hints */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-400 text-center space-y-1">
            <p>Admin: <span className="font-mono text-gray-600">admin@template.com</span> / <span className="font-mono text-gray-600">Admin@123456</span></p>
            <p>User: <span className="font-mono text-gray-600">user@template.com</span> / <span className="font-mono text-gray-600">User@123456</span></p>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-rose-600 hover:underline">
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
