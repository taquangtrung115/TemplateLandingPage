import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleOAuthCallback } = useAuth();

  const [status, setStatus] = useState('processing'); // 'processing' | 'error' | 'success'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      // 1. Check for query parameters indicating error from OAuth provider
      const searchParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.startsWith('#') ? location.hash.substring(1) : location.hash);

      const error = searchParams.get('error') || hashParams.get('error');
      const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

      if (error) {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage(
          errorDescription
            ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
            : 'Xác thực tài khoản qua mạng xã hội bị từ chối hoặc đã xảy ra lỗi.'
        );
        return;
      }

      try {
        // 2. Fetch session from Supabase Client
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          await completeLogin(session);
          return;
        }

        // 3. If session is not ready yet, listen for onAuthStateChange
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (event === 'SIGNED_IN' && newSession) {
            authListener?.subscription?.unsubscribe();
            await completeLogin(newSession);
          }
        });

        // 4. Timeout fallback if no session received within 7 seconds
        setTimeout(() => {
          if (isMounted && status === 'processing') {
            setStatus('error');
            setErrorMessage('Phiên đăng nhập đã hết hạn hoặc không tìm thấy dữ liệu xác thực.');
          }
        }, 7000);
      } catch (err) {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage(err.message || 'Không thể hoàn tất đăng nhập. Vui lòng thử lại!');
      }
    };

    const completeLogin = async (session) => {
      try {
        const loggedInUser = await handleOAuthCallback(session);
        if (!isMounted) return;
        setStatus('success');

        // Redirect based on role
        if (loggedInUser?.role === 'Admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/templates', { replace: true });
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage(err.message || 'Đăng nhập thất bại từ máy chủ.');
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [location, handleOAuthCallback, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-gray-900 tracking-tight">
            Motion<span className="text-rose-600">Sites</span>
          </span>
        </Link>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 sm:px-10 shadow-xl shadow-gray-200/50 rounded-3xl border border-gray-100 text-center">
          {status === 'processing' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
              <h3 className="text-lg font-bold text-gray-900">Đang đồng bộ tài khoản...</h3>
              <p className="text-xs text-gray-500 max-w-xs">
                Vui lòng đợi trong giây lát trong khi chúng tôi hoàn tất xác thực và chuyển hướng bạn.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Đăng nhập thành công!</h3>
              <p className="text-xs text-gray-500">Đang chuyển bạn về trang chính...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Xác thực không thành công</h3>
              <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 w-full text-left">
                {errorMessage}
              </p>
              <div className="pt-2 w-full flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full py-3 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại trang Đăng Nhập</span>
                </Link>
                <Link
                  to="/"
                  className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  Về Trang Chủ
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
