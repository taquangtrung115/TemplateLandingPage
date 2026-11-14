import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../src/pages/auth/RegisterPage';
import useAuth from '../src/hooks/useAuth';

// Mock useNavigate
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useAuth
vi.mock('../src/hooks/useAuth', () => ({
  default: vi.fn(),
}));

describe('RegisterPage Component', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      register: mockRegister,
    });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
  };

  describe('Happy Paths (Đường thuận lợi)', () => {
    it('successfully registers new user and navigates to /templates', async () => {
      mockRegister.mockResolvedValueOnce({
        id: 'new-user-id',
        email: 'test@example.com',
        fullName: 'Nguyễn Văn Minh',
        role: 'User',
      });

      renderComponent();

      fireEvent.change(screen.getByPlaceholderText('Nguyễn Văn Minh'), {
        target: { value: 'Nguyễn Văn Minh' },
      });
      fireEvent.change(screen.getByPlaceholderText('minh@example.com'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'Password123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /hoàn tất đăng ký/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          'test@example.com',
          'Password123!',
          'Nguyễn Văn Minh'
        );
        expect(mockNavigate).toHaveBeenCalledWith('/templates', { replace: true });
      });
    });
  });

  describe('Edge Cases (Trường hợp biên)', () => {
    it('displays error message when registering with duplicate email', async () => {
      mockRegister.mockRejectedValueOnce(
        new Error('Email này đã được sử dụng bởi một tài khoản khác.')
      );

      renderComponent();

      fireEvent.change(screen.getByPlaceholderText('Nguyễn Văn Minh'), {
        target: { value: 'Trùng Email' },
      });
      fireEvent.change(screen.getByPlaceholderText('minh@example.com'), {
        target: { value: 'duplicate@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'Password123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /hoàn tất đăng ký/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Email này đã được sử dụng bởi một tài khoản khác.')
        ).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: /hoàn tất đăng ký/i })).not.toBeDisabled();
    });
  });

  describe('Failure Paths (Trường hợp thất bại)', () => {
    it('displays fallback error message when register throws without an error message', async () => {
      mockRegister.mockRejectedValueOnce({});

      renderComponent();

      fireEvent.change(screen.getByPlaceholderText('Nguyễn Văn Minh'), {
        target: { value: 'Lỗi Không Rõ' },
      });
      fireEvent.change(screen.getByPlaceholderText('minh@example.com'), {
        target: { value: 'error@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'Password123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /hoàn tất đăng ký/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Đăng ký không thành công. Vui lòng kiểm tra lại thông tin!')
        ).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('has required attributes and minLength of 6 on password input', () => {
      renderComponent();

      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('minLength', '6');

      const emailInput = screen.getByPlaceholderText('minh@example.com');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');

      const nameInput = screen.getByPlaceholderText('Nguyễn Văn Minh');
      expect(nameInput).toHaveAttribute('required');
    });
  });
});
