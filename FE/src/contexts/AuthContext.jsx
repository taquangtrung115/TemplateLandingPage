import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { signInWithGoogle, signInWithFacebook, supabase } from '../lib/supabaseClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser || savedUser === 'undefined' || savedUser === 'null') return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken || savedToken === 'undefined' || savedToken === 'null') return null;
    return savedToken;
  });
  const [loading, setLoading] = useState(true);

  // Sync profile on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
        try {
          const res = await authApi.getMe();
          const profile = res?.value ?? res;
          if (profile) {
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    const payload = data?.value ?? data;
    const jwtToken = payload?.token;
    const userProfile = payload?.user;

    if (jwtToken) {
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
    }
    if (userProfile) {
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);
    }
    return userProfile;
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    const data = await authApi.register({ email, password, fullName });
    const payload = data?.value ?? data;
    if (payload?.token && payload?.user) {
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
      setToken(payload.token);
      setUser(payload.user);
      return payload.user;
    }
    // Backend RegisterCommand trả về Guid, tự động gọi login để thiết lập phiên đăng nhập
    return await login(email, password);
  }, [login]);

  const loginWithOAuth = useCallback(async (provider) => {
    if (provider === 'google') {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } else if (provider === 'facebook') {
      const { error } = await signInWithFacebook();
      if (error) throw error;
    } else {
      throw new Error('Unsupported OAuth provider');
    }
  }, []);

  const handleOAuthCallback = useCallback(async (session) => {
    if (!session?.user) {
      throw new Error('Không tìm thấy thông tin phiên xác thực từ mạng xã hội.');
    }

    const { user: sbUser, access_token } = session;
    const provider = sbUser.app_metadata?.provider === 'facebook' ? 'Facebook' : 'Google';
    const email = sbUser.email;
    const fullName =
      sbUser.user_metadata?.full_name ||
      sbUser.user_metadata?.name ||
      sbUser.email?.split('@')[0] ||
      'Người dùng';
    const avatarUrl =
      sbUser.user_metadata?.avatar_url ||
      sbUser.user_metadata?.picture ||
      null;

    const payload = {
      provider,
      email,
      fullName,
      avatarUrl,
      idToken: access_token,
    };

    const data = await authApi.externalLogin(payload);
    const authResult = data?.value ?? data;

    if (authResult?.token && authResult?.user) {
      localStorage.setItem('token', authResult.token);
      localStorage.setItem('user', JSON.stringify(authResult.user));
      setToken(authResult.token);
      setUser(authResult.user);
      return authResult.user;
    }

    throw new Error('Phản hồi đăng nhập không hợp lệ từ máy chủ.');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    try {
      supabase.auth.signOut().catch(() => {});
    } catch {
      // Ignore Supabase signout error
    }
  }, []);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'Admin';

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    loginWithOAuth,
    handleOAuthCallback,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
