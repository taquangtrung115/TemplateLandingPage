import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../src/pages/auth/LoginPage';

vi.mock('../src/api/authApi', () => ({ authApi: { registration: vi.fn().mockResolvedValue({ allowSelfRegistration: false }) } }));
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage - Kiểm thử bảo mật & giao diện đăng nhập', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // 1. HAPPY PATH (Đường chạy thuận lợi)
  // ==========================================
  describe('1. Đường chạy thuận lợi (Happy Path)', () => {
    it('hiển thị đầy đủ thông tin thương hiệu CHUỖI ĂN VẶT và form đăng nhập', () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      expect(screen.getByText('CHUỖI ĂN VẶT')).toBeInTheDocument();
      expect(screen.getByText('Chào mừng trở lại')).toBeInTheDocument();
      expect(screen.getByText('Phân Hệ Báo giá & Quản Lý Thương Mại')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeInTheDocument();
    });

    it('cho phép nhập thông tin hợp lệ và submit đăng nhập thành công', async () => {
      mockLogin.mockResolvedValueOnce({ success: true });

      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('name@company.com');
      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');
      const submitBtn = screen.getByRole('button', { name: /Đăng nhập/i });

      fireEvent.change(emailInput, { target: { value: 'admin@chuoianvat.vn' } });
      fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(1);
        expect(mockLogin).toHaveBeenCalledWith('admin@chuoianvat.vn', 'Secret123!');
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });
  });

  // ==========================================
  // 2. EDGE CASES (Các trường hợp biên & OWASP)
  // ==========================================
  describe('2. Các trường hợp biên (Edge Cases & Bảo mật OWASP)', () => {
    it.each([
      [{ pathname: '/quotations/quote-id/edit', search: '?source=direct', hash: '#items' }, '/quotations/quote-id/edit?source=direct#items'],
      [{ pathname: '//example.test' }, '/'],
      [{ pathname: '/login/' }, '/'],
    ])('returns only to a local protected location after login: %j', async (from, destination) => {
      mockLogin.mockResolvedValueOnce({ success: true });
      render(<MemoryRouter initialEntries={[{ pathname: '/login', state: { from } }]}><LoginPage /></MemoryRouter>);
      fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'user@example.test' } });
      fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu'), { target: { value: 'Synthetic123!' } });
      fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập', exact: true }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(destination, { replace: true }));
    });

    it('tuân thủ OWASP: không prefill mật khẩu hoặc email khi mới tải trang', () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('name@company.com');
      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');

      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('tuân thủ OWASP: toggle ẩn/hiện mật khẩu hoạt động chuẩn xác', () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');
      const toggleBtn = screen.getByLabelText('Hiện mật khẩu');

      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click để hiện mật khẩu
      fireEvent.click(toggleBtn);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Ẩn mật khẩu')).toBeInTheDocument();

      // Click lại để ẩn mật khẩu
      fireEvent.click(screen.getByLabelText('Ẩn mật khẩu'));
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('chặn submit khi để trống email hoặc mật khẩu (validation client-side)', async () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      const submitBtn = screen.getByRole('button', { name: /Đăng nhập/i });

      // Trường hợp cả hai trường trống
      fireEvent.click(submitBtn);
      expect(mockLogin).not.toHaveBeenCalled();
      expect(screen.getByText('Vui lòng nhập đầy đủ Email và Mật khẩu.')).toBeInTheDocument();

      // Trường hợp chỉ nhập khoảng trắng
      const emailInput = screen.getByPlaceholderText('name@company.com');
      fireEvent.change(emailInput, { target: { value: '   ' } });
      fireEvent.click(submitBtn);
      expect(mockLogin).not.toHaveBeenCalled();
      expect(screen.getByText('Vui lòng nhập đầy đủ Email và Mật khẩu.')).toBeInTheDocument();
    });

    it('tự động xóa thông báo lỗi khi người dùng bắt đầu sửa lại input', async () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      const submitBtn = screen.getByRole('button', { name: /Đăng nhập/i });
      fireEvent.click(submitBtn);
      expect(screen.getByText('Vui lòng nhập đầy đủ Email và Mật khẩu.')).toBeInTheDocument();

      // Người dùng gõ vào ô email
      const emailInput = screen.getByPlaceholderText('name@company.com');
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });

      expect(screen.queryByText('Vui lòng nhập đầy đủ Email và Mật khẩu.')).not.toBeInTheDocument();
    });
  });

  // ==========================================
  // 3. NEGATIVE / FAILURE CASES (Trường hợp thất bại)
  // ==========================================
  describe('3. Trường hợp thất bại (Failure Cases)', () => {
    it('hiển thị Banner thông báo lỗi khi xác thực tài khoản thất bại từ phía máy chủ', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Tài khoản hoặc mật khẩu không chính xác.'));

      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('name@company.com');
      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');
      const submitBtn = screen.getByRole('button', { name: /Đăng nhập/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@user.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
        expect(screen.getByText('Lỗi xác thực')).toBeInTheDocument();
        expect(screen.getByText('Tài khoản hoặc mật khẩu không chính xác.')).toBeInTheDocument();
      });
    });
  });
});
