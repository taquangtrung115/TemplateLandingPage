import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, it, expect, vi } from 'vitest';
import RegisterPage from '../src/pages/auth/RegisterPage';
import RegistrationSettingsPage from '../src/pages/admin/RegistrationSettingsPage';
import { authApi } from '../src/api/authApi';
import { workspaceApi } from '../src/api/workspaceApi';
vi.mock('../src/api/authApi', () => ({ authApi: { registration: vi.fn(), register: vi.fn() } }));
vi.mock('../src/api/workspaceApi', () => ({ workspaceApi: { configureRegistration: vi.fn() } }));
vi.mock('../src/contexts/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: false, loading: false }) }));
beforeEach(() => { vi.clearAllMocks(); authApi.registration.mockResolvedValue({ tenantName: 'Acme', appKey: 'quoting', allowSelfRegistration: true }); });
const open = () => render(<MemoryRouter><RegisterPage/></MemoryRouter>);
async function fill() {
  await screen.findByLabelText(/Họ tên/); fireEvent.change(screen.getByLabelText(/Họ tên/), { target: { value: 'New User' } }); fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'new@example.test' } });
  fireEvent.change(screen.getByLabelText(/^Mật khẩu/), { target: { value: 'Synthetic-123!' } }); fireEvent.change(screen.getByLabelText(/^Xác nhận mật khẩu/), { target: { value: 'Synthetic-123!' } });
}
it('does not show a signup form when registration is closed', async () => {
  authApi.registration.mockResolvedValue({ tenantName: 'Acme', allowSelfRegistration: false }); open(); expect(await screen.findByText('Workspace chưa mở đăng ký')).toBeInTheDocument(); expect(screen.queryByRole('button', { name: 'Tạo tài khoản' })).not.toBeInTheDocument(); expect(authApi.register).not.toHaveBeenCalled();
});
it('registers only identity fields and requires login after success', async () => {
  authApi.register.mockResolvedValue('user-id'); open(); await fill(); fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản', exact: true }));
  await waitFor(() => expect(authApi.register).toHaveBeenCalledWith({ fullName: 'New User', email: 'new@example.test', password: 'Synthetic-123!' })); expect(await screen.findByText('Tạo tài khoản thành công')).toBeInTheDocument(); expect(screen.getByRole('link', { name: 'Về đăng nhập' })).toHaveAttribute('href', '/login');
});
it('rejects a mismatching confirmation without calling the API', async () => {
  open(); await fill(); fireEvent.change(screen.getByLabelText(/^Xác nhận mật khẩu/), { target: { value: 'wrong' } }); fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản', exact: true })); expect(await screen.findByText('Mật khẩu xác nhận chưa khớp.')).toBeInTheDocument(); expect(authApi.register).not.toHaveBeenCalled();
});
it('keeps identity fields and permits retry after server rejection', async () => {
  authApi.register.mockRejectedValue(new Error('Email đã tồn tại')); open(); await fill(); fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản', exact: true })); expect(await screen.findByText('Email đã tồn tại')).toBeInTheDocument(); expect(screen.getByLabelText(/Họ tên/)).toHaveValue('New User'); expect(screen.getByRole('button', { name: 'Tạo tài khoản', exact: true })).toBeEnabled();
});
it('blocks duplicate submits while registration is pending', async () => {
  authApi.register.mockReturnValue(new Promise(() => {})); open(); await fill(); const button = screen.getByRole('button', { name: 'Tạo tài khoản', exact: true }); fireEvent.click(button); fireEvent.click(button); await waitFor(() => expect(authApi.register).toHaveBeenCalledTimes(1));
});
it('reports a failed registration-options request and can retry', async () => {
  authApi.registration.mockRejectedValueOnce(new Error('Không kết nối được')); open(); expect(await screen.findByText('Không kết nối được')).toBeInTheDocument(); fireEvent.click(screen.getByRole('button', { name: 'Thử lại' })); expect(await screen.findByLabelText(/Họ tên/)).toBeInTheDocument();
});
it('toggles only the current workspace registration setting', async () => {
  workspaceApi.configureRegistration.mockResolvedValue({ tenantName: 'Acme', appKey: 'quoting', allowSelfRegistration: false }); render(<RegistrationSettingsPage/>); fireEvent.click(await screen.findByRole('button', { name: 'Đóng tự đăng ký' })); await waitFor(() => expect(workspaceApi.configureRegistration).toHaveBeenCalledWith(false)); expect(await screen.findByRole('button', { name: 'Mở tự đăng ký' })).toBeInTheDocument();
});
