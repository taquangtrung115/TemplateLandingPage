import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';

export default function SocialAuthButtons({ mode = 'login', onError }) {
  const { loginWithOAuth } = useAuth();
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' | 'facebook' | null

  const handleOAuth = async (provider) => {
    try {
      setOauthLoading(provider);
      await loginWithOAuth(provider);
      // Supabase OAuth redirects away to provider
    } catch (err) {
      setOauthLoading(null);
      if (onError) {
        onError(err.message || `Đăng nhập với ${provider} thất bại. Vui lòng thử lại!`);
      }
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="space-y-3">
      {/* Google Button */}
      <button
        type="button"
        disabled={!!oauthLoading}
        onClick={() => handleOAuth('google')}
        className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50/80 active:scale-[0.99] text-gray-700 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {oauthLoading === 'google' ? (
          <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        )}
        <span>{isRegister ? 'Đăng ký với Google' : 'Tiếp tục với Google'}</span>
      </button>

      {/* Facebook Button */}
      <button
        type="button"
        disabled={!!oauthLoading}
        onClick={() => handleOAuth('facebook')}
        className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50/80 active:scale-[0.99] text-gray-700 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {oauthLoading === 'facebook' ? (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )}
        <span>{isRegister ? 'Đăng ký với Facebook' : 'Tiếp tục với Facebook'}</span>
      </button>

      {/* Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="border-t border-gray-200 w-full" />
        <span className="bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-gray-400 absolute">
          {isRegister ? 'Hoặc đăng ký bằng email' : 'Hoặc tiếp tục với email'}
        </span>
      </div>
    </div>
  );
}
