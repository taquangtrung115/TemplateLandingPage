import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { authApi } from '../api/authApi';
import {
  applyAuthStorageEvent,
  clearAuthSession,
  readAuthToken,
  readAuthUser,
  writeAuthSession,
} from '../utils/authStorage';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readAuthUser);
  const [token, setToken] = useState(readAuthToken);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const savedToken = readAuthToken();
      if (!savedToken) {
        clearAuthSession();
        if (isMounted) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authApi.getMe();
        const profile = response?.value ?? response;
        if (isMounted && profile && readAuthToken() === savedToken) {
          setUser(profile);
          writeAuthSession(savedToken, profile);
          setAuthError(null);
        }
      } catch (error) {
        if (error.status === 401) {
          clearAuthSession();
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        } else if (isMounted) {
          setAuthError(error.message || 'Không thể kiểm tra phiên đăng nhập.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
      setAuthError(null);
    };
    window.addEventListener('quoting:session-expired', handleSessionExpired);
    return () => window.removeEventListener('quoting:session-expired', handleSessionExpired);
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === null) {
        clearAuthSession();
        setToken(null);
        setUser(null);
      }
      if (event.key === 'token') {
        applyAuthStorageEvent('token', event.newValue);
        setToken(event.newValue || null);
      }
      if (event.key === 'user') {
        applyAuthStorageEvent('user', event.newValue);
        setUser(readAuthUser());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    const payload = data?.value ?? data;
    const jwtToken = payload?.token;
    const userProfile = payload?.user;

    if (!jwtToken || !userProfile) throw new Error('Máy chủ không trả về phiên đăng nhập hợp lệ.');
    writeAuthSession(jwtToken, userProfile);
    setToken(jwtToken);
    setUser(userProfile);
    setAuthError(null);
    return userProfile;
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setUser(null);
    setAuthError(null);
  }, []);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'Admin';

  const value = {
    user,
    token,
    loading,
    authError,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
