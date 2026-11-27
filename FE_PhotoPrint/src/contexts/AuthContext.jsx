import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { authStorageKey, readAuthToken, writeAuthSession } from '../utils/authStorage';
import { APP_KEY } from '../utils/tenantScope';

const AuthContext = createContext(null);
const guest = { user: null, role: null, loading: false, error: '' };

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readAuthToken);
  const [session, setSession] = useState({ ...guest, loading: Boolean(token) });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const synchronize = event => {
      if (event.key === authStorageKey() || event.key === null) setToken(readAuthToken());
    };
    window.addEventListener('storage', synchronize);
    return () => window.removeEventListener('storage', synchronize);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (!token) {
      setSession(guest);
      return;
    }
    setSession({ ...guest, loading: true });
    authApi.getMe(controller.signal).then(async user => {
      try {
        const context = await authApi.getContext(controller.signal);
        if (!controller.signal.aborted) setSession({ ...guest, user, role: context?.appKey === APP_KEY ? context.role : null });
      } catch (error) {
        if (!controller.signal.aborted) setSession({ ...guest, user, error: error.message });
      }
    }).catch(error => {
      if (controller.signal.aborted) return;
      if (error.status === 401) {
        writeAuthSession(null);
        setToken(null);
      } else setSession({ ...guest, error: error.message });
    });
    return () => controller.abort();
  }, [token, version]);

  function start(data) {
    if (!data?.token) throw new Error('Máy chủ chưa trả về phiên đăng nhập.');
    writeAuthSession(data.token);
    setToken(data.token);
  }

  const login = async data => start(await authApi.login(data));
  const register = async data => {
    const result = await authApi.register(data);
    if (result?.token) start(result);
    else await login({ email: data.email, password: data.password });
  };
  const logout = () => {
    writeAuthSession(null);
    setToken(null);
    setSession(guest);
  };

  return <AuthContext.Provider value={{
    ...session, token, login, register, logout, retry: () => setVersion(value => value + 1),
    isAdmin: Boolean(token) && session.role === 'Admin',
  }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
