import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync profile on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    const { token: jwtToken, user: userProfile } = data;
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userProfile));
    setToken(jwtToken);
    setUser(userProfile);
    return userProfile;
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    const data = await authApi.register({ email, password, fullName });
    const { token: jwtToken, user: userProfile } = data;
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userProfile));
    setToken(jwtToken);
    setUser(userProfile);
    return userProfile;
  }, []);

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
