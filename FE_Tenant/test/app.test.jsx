import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, it, expect, vi } from 'vitest';
import App from '../src/App';
import { tenantApi } from '../src/api/tenantApi';
vi.mock('../src/api/tenantApi', () => ({ tenantApi: { login: vi.fn(), me: vi.fn(), list: vi.fn(), create: vi.fn(), update: vi.fn(), configure: vi.fn(), members: vi.fn(), setMember: vi.fn(), createUser: vi.fn() } }));
const tenant = { id: 'company-a', key: 'acme', name: 'Acme', isActive: true, applications: [{ appKey: 'quoting', isEnabled: true, allowSelfRegistration: false, provisioningStatus: 'Ready', seedVersion: 1 }] };
beforeEach(() => { vi.clearAllMocks(); tenantApi.list.mockResolvedValue({ items: [tenant] }); tenantApi.members.mockResolvedValue({ items: [] }); tenantApi.me.mockResolvedValue({ id: 'admin', isPlatformAdmin: true }); });
async function dashboard() { localStorage.setItem('oneportal.tenant.token', 'test-token'); render(<App/>); await screen.findByText('Acme'); }
it('rejects tenant administrators without PlatformAdmin access', async () => {
  tenantApi.login.mockResolvedValue({ token: 'token', user: { isPlatformAdmin: false } }); render(<App/>);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'tenant@test.local' } });
  fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'password' } }); fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Platform Admin'); expect(localStorage.getItem('oneportal.tenant.token')).toBeNull();
});
it('creates a workspace with the chosen application and initial administrator', async () => {
  tenantApi.create.mockResolvedValue({}); await dashboard(); fireEvent.click(screen.getByRole('button', { name: 'Tạo workspace' }));
  fireEvent.change(screen.getByLabelText('Tên công ty'), { target: { value: 'Beta' } }); fireEvent.change(screen.getByLabelText('Mã workspace'), { target: { value: 'beta' } });
  fireEvent.change(screen.getByLabelText('Email quản trị viên đã có'), { target: { value: 'admin@test.local' } });
  fireEvent.click(screen.getByRole('button', { name: 'Tạo & khởi tạo dữ liệu' }));
  await waitFor(() => expect(tenantApi.create).toHaveBeenCalledWith({ key: 'beta', name: 'Beta', applications: ['quoting'], adminEmail: 'admin@test.local' }));
  expect(await screen.findByRole('status')).toHaveTextContent('khởi tạo dữ liệu nền tảng');
});
it('preserves tenant form data when initialization fails', async () => {
  tenantApi.create.mockRejectedValue(new Error('Không thể khởi tạo')); await dashboard(); fireEvent.click(screen.getByRole('button', { name: 'Tạo workspace' }));
  fireEvent.change(screen.getByLabelText('Tên công ty'), { target: { value: 'Beta' } }); fireEvent.change(screen.getByLabelText('Mã workspace'), { target: { value: 'beta' } });
  fireEvent.click(screen.getByRole('button', { name: 'Tạo & khởi tạo dữ liệu' })); expect(await screen.findByRole('alert')).toHaveTextContent('Không thể khởi tạo'); expect(screen.getByLabelText('Tên công ty')).toHaveValue('Beta');
});
it('shows provisioning status and retries seed without creating a second tenant', async () => {
  tenantApi.configure.mockResolvedValue({}); await dashboard(); fireEvent.click(screen.getByText('Acme'));
  expect(await screen.findByText('Ready · Seed v1')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Chạy lại khởi tạo' }));
  await waitFor(() => expect(tenantApi.configure).toHaveBeenCalledWith('company-a', 'quoting', { isEnabled: true, allowSelfRegistration: false }));
  expect(tenantApi.create).not.toHaveBeenCalled();
});
it('keeps global user creation independent of tenant roles', async () => {
  tenantApi.createUser.mockResolvedValue({}); await dashboard(); fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));
  fireEvent.change(screen.getByLabelText('Họ tên'), { target: { value: 'New User' } }); fireEvent.change(screen.getByLabelText('Email tài khoản mới'), { target: { value: 'new@test.local' } }); fireEvent.change(screen.getByLabelText('Mật khẩu ban đầu'), { target: { value: 'synthetic-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu tài khoản' })); await waitFor(() => expect(tenantApi.createUser).toHaveBeenCalledWith({ fullName: 'New User', email: 'new@test.local', password: 'synthetic-password' }));
});
