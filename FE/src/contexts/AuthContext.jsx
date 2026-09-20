import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

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

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
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
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
