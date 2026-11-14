import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider } from '../src/contexts/AuthContext';
import useAuth from '../src/hooks/useAuth';
import { authApi } from '../src/api/authApi';

// Mock authApi
vi.mock('../src/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
  },
}));

// Test consumer component
const TestConsumer = ({ onAuthChange }) => {
  const auth = useAuth();

  React.useEffect(() => {
    if (onAuthChange) {
      onAuthChange(auth);
    }
  }, [auth, onAuthChange]);

  return (
    <div>
      <div data-testid="auth-loading">{auth.loading ? 'loading' : 'ready'}</div>
      <div data-testid="auth-status">{auth.isAuthenticated ? 'authenticated' : 'unauthenticated'}</div>
      <div data-testid="user-role">{auth.user?.role || 'no-role'}</div>
      <div data-testid="user-email">{auth.user?.email || 'no-email'}</div>
      <div data-testid="is-admin">{auth.isAdmin ? 'yes' : 'no'}</div>
      <button data-testid="btn-logout" onClick={auth.logout}>Logout</button>
    </div>
  );
};

describe('AuthContext and AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Happy Path', () => {
    it('login with Admin account stores valid token & user, sets isAdmin to true', async () => {
      const adminUser = { id: 'admin-1', email: 'admin@template.com', fullName: 'System Admin', role: 'Admin' };
      const adminToken = 'jwt-admin-valid-token';

      authApi.login.mockResolvedValueOnce({
        isSuccess: true,
        value: {
          token: adminToken,
          user: adminUser,
        },
      });

      let authInstance;
      render(
        <AuthProvider>
          <TestConsumer onAuthChange={(auth) => { authInstance = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading')).toHaveTextContent('ready');
      });

      let loginResult;
      await act(async () => {
        loginResult = await authInstance.login('admin@template.com', 'Admin@123456');
      });

      expect(loginResult).toEqual(adminUser);
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('Admin');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('yes');
      expect(localStorage.getItem('token')).toBe(adminToken);
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(adminUser);
    });

    it('login with regular User account sets isAuthenticated=true, isAdmin=false', async () => {
      const regularUser = { id: 'user-1', email: 'user@template.com', fullName: 'Normal User', role: 'User' };
      const userToken = 'jwt-user-valid-token';

      authApi.login.mockResolvedValueOnce({
        token: userToken,
        user: regularUser,
      });

      let authInstance;
      render(
        <AuthProvider>
          <TestConsumer onAuthChange={(auth) => { authInstance = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading')).toHaveTextContent('ready');
      });

      await act(async () => {
        await authInstance.login('user@template.com', 'User@123456');
      });

      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('User');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('no');
      expect(localStorage.getItem('token')).toBe(userToken);
    });

    it('logout clears localStorage and resets auth state', async () => {
      localStorage.setItem('token', 'valid-token');
      localStorage.setItem('user', JSON.stringify({ email: 'user@test.com', role: 'User' }));

      authApi.getMe.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@test.com',
        role: 'User',
      });

      let authInstance;
      render(
        <AuthProvider>
          <TestConsumer onAuthChange={(auth) => { authInstance = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      act(() => {
        authInstance.logout();
      });

      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('safely handles localStorage contaminated with string "undefined"', async () => {
      localStorage.setItem('token', 'undefined');
      localStorage.setItem('user', 'undefined');

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading')).toHaveTextContent('ready');
      });

      // Should not throw SyntaxError, should be unauthenticated and cleaned up
      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(authApi.getMe).not.toHaveBeenCalled();
    });

    it('safely handles localStorage contaminated with string "null"', async () => {
      localStorage.setItem('token', 'null');
      localStorage.setItem('user', 'null');

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading')).toHaveTextContent('ready');
      });

      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(authApi.getMe).not.toHaveBeenCalled();
    });

    it('register auto-triggers login when backend returns Guid only', async () => {
      const createdGuid = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
      const loggedInUser = { id: createdGuid, email: 'new@template.com', fullName: 'New User', role: 'User' };
      const sessionToken = 'jwt-session-token-after-reg';

      // authApi.register returns Guid (Result.value or raw Guid)
      authApi.register.mockResolvedValueOnce({
        isSuccess: true,
        value: createdGuid,
      });

      // authApi.login is called automatically by register()
      authApi.login.mockResolvedValueOnce({
        token: sessionToken,
        user: loggedInUser,
      });

      let authInstance;
      render(
        <AuthProvider>
          <TestConsumer onAuthChange={(auth) => { authInstance = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading')).toHaveTextContent('ready');
      });

      let regResult;
      await act(async () => {
        regResult = await authInstance.register('new@template.com', 'Password123!', 'New User');
      });

      expect(regResult).toEqual(loggedInUser);
      expect(authApi.register).toHaveBeenCalledWith({
        email: 'new@template.com',
        password: 'Password123!',
        fullName: 'New User',
      });
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'new@template.com',
        password: 'Password123!',
      });
      expect(localStorage.getItem('token')).toBe(sessionToken);
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(loggedInUser);
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    it('register handles direct payload if backend already returns token & user', async () => {
      const directUser = { id: 'u-direct', email: 'direct@template.com', role: 'User' };
      const directToken = 'jwt-direct-token';

      authApi.register.mockResolvedValueOnce({
        token: directToken,
        user: directUser,
      });

      let authInstance;
      render(
        <AuthProvider>
          <TestConsumer onAuthChange={(auth) => { authInstance = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading')).toHaveTextContent('ready');
      });

      await act(async () => {
        await authInstance.register('direct@template.com', 'Pass123!', 'Direct User');
      });

      expect(authApi.login).not.toHaveBeenCalled();
      expect(localStorage.getItem('token')).toBe(directToken);
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(directUser);
    });

    it('F5 refresh syncs profile via getMe() and unwraps Result wrapper', async () => {
      localStorage.setItem('token', 'persisted-jwt-token');
      const syncedProfile = { id: 'u-sync', email: 'persisted@test.com', role: 'Admin' };

      authApi.getMe.mockResolvedValueOnce({
        isSuccess: true,
        value: syncedProfile,
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading')).toHaveTextContent('ready');
      });

      expect(authApi.getMe).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('Admin');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('yes');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(syncedProfile);
    });

    it('F5 refresh cleans up token & user if getMe() fails (token expired)', async () => {
      localStorage.setItem('token', 'expired-jwt-token');
      localStorage.setItem('user', JSON.stringify({ email: 'old@test.com' }));

      authApi.getMe.mockRejectedValueOnce({ status: 401 });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading')).toHaveTextContent('ready');
      });

      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('keeps the current session when profile refresh fails because the network is unavailable', async () => {
      localStorage.setItem('token', 'temporary-network-outage-token');
      localStorage.setItem('user', JSON.stringify({ id: 'u-network', email: 'network@test.com', role: 'User' }));
      authApi.getMe.mockRejectedValueOnce(new Error('Network unavailable'));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading')).toHaveTextContent('ready');
      });

      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(localStorage.getItem('token')).toBe('temporary-network-outage-token');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual({
        id: 'u-network',
        email: 'network@test.com',
        role: 'User',
      });
    });
  });

  describe('Failure Paths', () => {
    it('when login fails with wrong credentials, rethrows error and does not store dirty token', async () => {
      authApi.login.mockRejectedValueOnce(new Error('Sai tài khoản hoặc mật khẩu!'));

      let authInstance;
      render(
        <AuthProvider>
          <TestConsumer onAuthChange={(auth) => { authInstance = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading')).toHaveTextContent('ready');
      });

      await expect(
        authInstance.login('wrong@test.com', 'wrongpassword')
      ).rejects.toThrow('Sai tài khoản hoặc mật khẩu!');

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    });

    it('defensive check: does not store "undefined" if login returns payload missing token or user', async () => {
      authApi.login.mockResolvedValueOnce({
        token: undefined,
        user: undefined,
      });

      let authInstance;
      render(
        <AuthProvider>
          <TestConsumer onAuthChange={(auth) => { authInstance = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading')).toHaveTextContent('ready');
      });

      await expect(authInstance.login('test@test.com', 'Password123!'))
        .rejects.toThrow('Máy chủ không trả về phiên đăng nhập hợp lệ.');

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
