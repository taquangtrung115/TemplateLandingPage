import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../src/pages/auth/LoginPage';
import useAuth from '../src/hooks/useAuth';

// Mock useNavigate and useLocation
const mockNavigate = vi.fn();
let mockLocationState = null;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: '/login',
      state: mockLocationState,
    }),
  };
});

// Mock useAuth
vi.mock('../src/hooks/useAuth', () => ({
  default: vi.fn(),
}));

describe('LoginPage Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState = null;
    useAuth.mockReturnValue({
      login: mockLogin,
    });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
  };

  describe('Happy Paths', () => {
    it('navigates to /admin when Admin logs in successfully', async () => {
      mockLogin.mockResolvedValueOnce({
        id: 'admin-1',
        email: 'admin@template.com',
        role: 'Admin',
      });

      renderComponent();

      fireEvent.change(screen.getByPlaceholderText(/Input email|admin@template\.com/i), {
        target: { value: 'admin@template.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'Admin@123456' },
      });

      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin@template.com', 'Admin@123456');
        expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
      });
    });

    it('navigates to root / when regular User logs in successfully', async () => {
      mockLogin.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@template.com',
        role: 'User',
      });

      renderComponent();

      fireEvent.change(screen.getByPlaceholderText(/Input email|admin@template\.com/i), {
        target: { value: 'user@template.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'User@123456' },
      });

      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('user@template.com', 'User@123456');
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('navigates to previous location if specified in location.state.from', async () => {
      mockLocationState = { from: { pathname: '/templates/custom-1' } };
      mockLogin.mockResolvedValueOnce({
        id: 'user-2',
        email: 'user2@template.com',
        role: 'User',
      });

      renderComponent();

      fireEvent.change(screen.getByPlaceholderText(/Input email|admin@template\.com/i), {
        target: { value: 'user2@template.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'User@123456' },
      });

      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/templates/custom-1', { replace: true });
      });
    });
  });

  describe('Edge Cases & Defensive Optional Chaining', () => {
    it('does NOT throw TypeError: Cannot read properties of undefined (reading "role") when user is undefined', async () => {
      // Critical regression test for user?.role === 'Admin'
      mockLogin.mockResolvedValueOnce(undefined);

      renderComponent();

      fireEvent.change(screen.getByPlaceholderText(/Input email|admin@template\.com/i), {
        target: { value: 'admin@template.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'password' },
      });

      // Submitting must NOT throw an uncaught exception
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
        // Falls back safely to redirect
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });

      // No crash error displayed
      expect(screen.queryByText(/cannot read properties of undefined/i)).not.toBeInTheDocument();
    });

    it('does NOT crash when user is null', async () => {
      mockLogin.mockResolvedValueOnce(null);

      renderComponent();

      fireEvent.change(screen.getByPlaceholderText(/Input email|admin@template\.com/i), {
        target: { value: 'admin@template.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'password' },
      });

      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('safely handles user object without role property', async () => {
      mockLogin.mockResolvedValueOnce({ email: 'norole@test.com' });

      renderComponent();

      fireEvent.change(screen.getByPlaceholderText(/Input email|admin@template\.com/i), {
        target: { value: 'norole@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'password' },
      });

      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });
  });

  describe('Failure Paths', () => {
    it('displays error message and does not navigate when login fails with invalid credentials', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Tài khoản hoặc mật khẩu không chính xác'));

      renderComponent();

      fireEvent.change(screen.getByPlaceholderText(/Input email|admin@template\.com/i), {
        target: { value: 'invalid@template.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'WrongPass!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(screen.getByText('Tài khoản hoặc mật khẩu không chính xác')).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
      // Button returns to idle state
      expect(screen.getByRole('button', { name: /đăng nhập/i })).not.toBeDisabled();
    });

    it('displays fallback error message when error object has no message string', async () => {
      mockLogin.mockRejectedValueOnce({});

      renderComponent();

      fireEvent.change(screen.getByPlaceholderText(/Input email|admin@template\.com/i), {
        target: { value: 'invalid@template.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'WrongPass!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu!')
        ).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
