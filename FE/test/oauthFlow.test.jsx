import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SocialAuthButtons from '../src/components/auth/SocialAuthButtons';
import AuthCallbackPage from '../src/pages/auth/AuthCallbackPage';
import { AuthContext, AuthProvider } from '../src/contexts/AuthContext';
import { authApi } from '../src/api/authApi';
import { supabase } from '../src/lib/supabaseClient';

vi.mock('../src/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
    externalLogin: vi.fn(),
  },
  default: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
    externalLogin: vi.fn(),
  },
}));

vi.mock('../src/lib/supabaseClient', () => {
  const mockSignInWithOAuth = vi.fn().mockResolvedValue({ error: null });
  const mockGetSession = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
  const mockOnAuthStateChange = vi.fn().mockReturnValue({
    data: {
      subscription: { unsubscribe: vi.fn() },
    },
  });
  const mockSignOut = vi.fn().mockResolvedValue({ error: null });

  return {
    supabase: {
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signOut: mockSignOut,
      },
    },
    signInWithGoogle: vi.fn().mockResolvedValue({ error: null }),
    signInWithFacebook: vi.fn().mockResolvedValue({ error: null }),
    getSupabaseSession: mockGetSession,
    default: {
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signOut: mockSignOut,
      },
    },
  };
});

describe('SocialAuthButtons Component', () => {
  it('renders Google and Facebook buttons with correct labels in login mode', () => {
    const mockContext = {
      loginWithOAuth: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockContext}>
        <SocialAuthButtons mode="login" />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Tiếp tục với Google')).toBeInTheDocument();
    expect(screen.getByText('Tiếp tục với Facebook')).toBeInTheDocument();
    expect(screen.getByText('Hoặc tiếp tục với email')).toBeInTheDocument();
  });

  it('renders Google and Facebook buttons with correct labels in register mode', () => {
    const mockContext = {
      loginWithOAuth: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockContext}>
        <SocialAuthButtons mode="register" />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Đăng ký với Google')).toBeInTheDocument();
    expect(screen.getByText('Đăng ký với Facebook')).toBeInTheDocument();
    expect(screen.getByText('Hoặc đăng ký bằng email')).toBeInTheDocument();
  });

  it('triggers loginWithOAuth with google when Google button clicked', async () => {
    const mockLoginWithOAuth = vi.fn().mockResolvedValue();
    const mockContext = {
      loginWithOAuth: mockLoginWithOAuth,
    };

    render(
      <AuthContext.Provider value={mockContext}>
        <SocialAuthButtons mode="login" />
      </AuthContext.Provider>
    );

    const googleBtn = screen.getByText('Tiếp tục với Google').closest('button');
    fireEvent.click(googleBtn);
    expect(mockLoginWithOAuth).toHaveBeenCalledWith('google');
  });

  it('triggers loginWithOAuth with facebook when Facebook button clicked', async () => {
    const mockLoginWithOAuth = vi.fn().mockResolvedValue();
    const mockContext = {
      loginWithOAuth: mockLoginWithOAuth,
    };

    render(
      <AuthContext.Provider value={mockContext}>
        <SocialAuthButtons mode="login" />
      </AuthContext.Provider>
    );

    const facebookBtn = screen.getByText('Tiếp tục với Facebook').closest('button');
    fireEvent.click(facebookBtn);
    expect(mockLoginWithOAuth).toHaveBeenCalledWith('facebook');
  });
});

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('displays error message when error query parameter is present in URL', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback?error=access_denied&error_description=User+cancelled']}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Xác thực không thành công')).toBeInTheDocument();
      expect(screen.getByText('User cancelled')).toBeInTheDocument();
      expect(screen.getByText('Quay lại trang Đăng Nhập')).toBeInTheDocument();
    });
  });

  it('successfully processes session and calls backend externalLogin', async () => {
    const mockSession = {
      access_token: 'fake_supabase_token',
      user: {
        id: 'sb_user_1',
        email: 'testuser@gmail.com',
        app_metadata: { provider: 'google' },
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://lh3.googleusercontent.com/photo.jpg',
        },
      },
    };

    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    authApi.externalLogin.mockResolvedValueOnce({
      value: {
        token: 'backend_jwt_token',
        user: {
          id: 'be_user_id',
          email: 'testuser@gmail.com',
          fullName: 'Test User',
          role: 'User',
          avatarUrl: 'https://lh3.googleusercontent.com/photo.jpg',
          isActive: true,
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/templates" element={<div data-testid="templates-page">Templates Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(authApi.externalLogin).toHaveBeenCalledWith({
        provider: 'Google',
        email: 'testuser@gmail.com',
        fullName: 'Test User',
        avatarUrl: 'https://lh3.googleusercontent.com/photo.jpg',
        idToken: 'fake_supabase_token',
      });
      expect(localStorage.getItem('token')).toBe('backend_jwt_token');
    });
  });

  it('successfully handles Facebook OAuth callback with picture metadata', async () => {
    const mockSession = {
      access_token: 'fb_supabase_token',
      user: {
        id: 'sb_fb_user',
        email: 'metauser@facebook.com',
        app_metadata: { provider: 'facebook' },
        user_metadata: {
          name: 'Meta User',
          picture: 'https://graph.facebook.com/metauser/picture',
        },
      },
    };

    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    authApi.externalLogin.mockResolvedValueOnce({
      value: {
        token: 'fb_backend_token',
        user: {
          id: 'be_fb_id',
          email: 'metauser@facebook.com',
          fullName: 'Meta User',
          role: 'User',
          avatarUrl: 'https://graph.facebook.com/metauser/picture',
          isActive: true,
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/templates" element={<div data-testid="templates-page">Templates Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(authApi.externalLogin).toHaveBeenCalledWith({
        provider: 'Facebook',
        email: 'metauser@facebook.com',
        fullName: 'Meta User',
        avatarUrl: 'https://graph.facebook.com/metauser/picture',
        idToken: 'fb_supabase_token',
      });
      expect(localStorage.getItem('token')).toBe('fb_backend_token');
    });
  });

  it('navigates to /admin when authenticated external user has Admin role', async () => {
    const mockSession = {
      access_token: 'admin_token',
      user: {
        id: 'admin_1',
        email: 'admin@system.com',
        app_metadata: { provider: 'google' },
        user_metadata: { full_name: 'System Admin' },
      },
    };

    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    authApi.externalLogin.mockResolvedValueOnce({
      value: {
        token: 'admin_jwt',
        user: {
          id: 'admin_id',
          email: 'admin@system.com',
          fullName: 'System Admin',
          role: 'Admin',
          isActive: true,
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/admin" element={<div data-testid="admin-dashboard">Admin Dashboard</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    });
  });

  it('displays error UI when backend rejects external login (e.g., Inactive account)', async () => {
    const mockSession = {
      access_token: 'banned_user_token',
      user: {
        id: 'banned_1',
        email: 'banned@domain.com',
        app_metadata: { provider: 'google' },
        user_metadata: { full_name: 'Banned User' },
      },
    };

    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    authApi.externalLogin.mockRejectedValueOnce(new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!'));

    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Xác thực không thành công')).toBeInTheDocument();
      expect(screen.getByText('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!')).toBeInTheDocument();
      expect(screen.getByText('Quay lại trang Đăng Nhập')).toBeInTheDocument();
    });
  });

  it('displays error UI when Supabase getSession returns an error', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: new Error('Lỗi kết nối phiên xác thực từ Supabase!'),
    });

    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Xác thực không thành công')).toBeInTheDocument();
      expect(screen.getByText('Lỗi kết nối phiên xác thực từ Supabase!')).toBeInTheDocument();
    });
  });
});

describe('AuthContext OAuth Methods & Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('throws error when loginWithOAuth is called with an unsupported provider', async () => {
    let capturedContext = null;
    const TestComponent = () => {
      const auth = React.useContext(AuthContext);
      capturedContext = auth;
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await expect(capturedContext.loginWithOAuth('twitter')).rejects.toThrow('Unsupported OAuth provider');
    await expect(capturedContext.loginWithOAuth('github')).rejects.toThrow('Unsupported OAuth provider');
  });

  it('throws error when handleOAuthCallback receives null or invalid session', async () => {
    let capturedContext = null;
    const TestComponent = () => {
      const auth = React.useContext(AuthContext);
      capturedContext = auth;
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await expect(capturedContext.handleOAuthCallback(null)).rejects.toThrow('Không tìm thấy thông tin phiên xác thực từ mạng xã hội.');
    await expect(capturedContext.handleOAuthCallback({})).rejects.toThrow('Không tìm thấy thông tin phiên xác thực từ mạng xã hội.');
  });

  it('falls back fullName to email prefix and avatarUrl to null when metadata is empty', async () => {
    let capturedContext = null;
    const TestComponent = () => {
      const auth = React.useContext(AuthContext);
      capturedContext = auth;
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const emptyMetaSession = {
      access_token: 'dummy_token',
      user: {
        email: 'fallbackuser@gmail.com',
        app_metadata: {},
        user_metadata: {},
      },
    };

    authApi.externalLogin.mockResolvedValueOnce({
      token: 'jwt_fallback',
      user: {
        id: 'u_fallback',
        email: 'fallbackuser@gmail.com',
        fullName: 'fallbackuser',
        role: 'User',
      },
    });

    await act(async () => {
      await capturedContext.handleOAuthCallback(emptyMetaSession);
    });

    expect(authApi.externalLogin).toHaveBeenCalledWith({
      provider: 'Google', // defaults to Google when app_metadata.provider is not facebook
      email: 'fallbackuser@gmail.com',
      fullName: 'fallbackuser',
      avatarUrl: null,
      idToken: 'dummy_token',
    });
  });
});
