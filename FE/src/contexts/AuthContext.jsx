import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import {
  applyAuthStorageEvent,
  clearAuthSession,
  readAuthToken,
  readAuthUser,
  writeAuthSession,
} from '../utils/authStorage';

export const AuthContext = createContext(null);
const PENDING_AUTH_ACTION_KEY = 'pending_auth_action_v1';
const PENDING_ACTION_TYPES = ['save', 'createVersion', 'communityShare', 'publishVersion', 'unpublishVersion', 'unpublishSite'];
let inMemoryPendingAuthAction = null;

export const locationToPath = (location) => {
  if (typeof location === 'string') return location.startsWith('/') && !location.startsWith('//') ? location : '/';
  if (!location || typeof location !== 'object') return '/';
  const path = `${location.pathname || '/'}${location.search || ''}${location.hash || ''}`;
  return path.startsWith('/') && !path.startsWith('//') ? path : '/';
};

export const storePendingAuthAction = (action, returnTo) => {
  if (!action || !PENDING_ACTION_TYPES.includes(action.type)) return null;
  const pendingAction = {
    ...action,
    returnTo: locationToPath(returnTo || action.returnTo),
    createdAt: new Date().toISOString(),
  };
  inMemoryPendingAuthAction = pendingAction;
  try {
    window.localStorage.setItem(PENDING_AUTH_ACTION_KEY, JSON.stringify(pendingAction));
  } catch {
    // The pending action remains available for same-tab authentication.
  }
  return pendingAction;
};

export const getPendingAuthAction = () => {
  try {
    const value = JSON.parse(window.localStorage.getItem(PENDING_AUTH_ACTION_KEY) || 'null');
    if (value && PENDING_ACTION_TYPES.includes(value.type)) return value;
  } catch {
    // Use the in-memory copy when browser storage is unavailable.
  }
  return inMemoryPendingAuthAction;
};

export const clearPendingAuthAction = () => {
  inMemoryPendingAuthAction = null;
  try { window.localStorage.removeItem(PENDING_AUTH_ACTION_KEY); } catch { /* In-memory state is already cleared. */ }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readAuthUser);
  const [token, setToken] = useState(readAuthToken);
  const [loading, setLoading] = useState(true);
  const [authCheckError, setAuthCheckError] = useState(null);

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
        if (isMounted && profile) {
          setUser(profile);
          writeAuthSession(savedToken, profile);
          setAuthCheckError(null);
        }
      } catch (error) {
        if (error.status === 401) {
          clearAuthSession();
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        } else if (isMounted) {
          // A network failure does not prove the saved session is invalid.
          setAuthCheckError(error.message || 'Không thể kiểm tra phiên đăng nhập lúc này.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
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
    setAuthCheckError(null);
    return userProfile;
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    const data = await authApi.register({ email, password, fullName });
    const payload = data?.value ?? data;
    if (payload?.token && payload?.user) {
      writeAuthSession(payload.token, payload.user);
      setToken(payload.token);
      setUser(payload.user);
      return payload.user;
    }
    return login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setUser(null);
    setAuthCheckError(null);
  }, []);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'Admin';
  const accountId = user?.id || user?.userId || user?.email || null;

  const value = {
    user,
    token,
    loading,
    authCheckError,
    accountId,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
