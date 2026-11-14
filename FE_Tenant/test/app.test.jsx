import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { beforeEach, it, expect, vi } from 'vitest';
import App from '../src/App';
import { tenantApi } from '../src/api/tenantApi';
vi.mock('../src/api/tenantApi', () => ({ tenantApi: { login: vi.fn(), me: vi.fn(), list: vi.fn(), create: vi.fn(), update: vi.fn(), configure: vi.fn(), members: vi.fn(), setMember: vi.fn(), createMember: vi.fn() } }));
const tenant = { id: 'company-a', key: 'acme', name: 'Acme', isActive: true, applications: [{ appKey: 'quoting', isEnabled: true, allowSelfRegistration: false, provisioningStatus: 'Ready', seedVersion: 1 }] };
beforeEach(() => { vi.clearAllMocks(); tenantApi.list.mockResolvedValue({ items: [tenant] }); tenantApi.members.mockResolvedValue({ items: [] }); tenantApi.me.mockResolvedValue({ id: 'admin', isPlatformAdmin: true }); });
async function dashboard() { localStorage.setItem('oneportal.tenant.token', 'test-token'); render(<App/>); await screen.findByRole('heading', { name: 'Acme' }); await screen.findByText('Chưa có người dùng'); }
async function companyForm() { await dashboard(); fireEvent.click(screen.getByRole('button', { name: 'Thêm công ty' })); fireEvent.change(screen.getByLabelText('Tên công ty'), { target: { value: 'Beta' } }); fireEvent.change(screen.getByLabelText('Mã workspace'), { target: { value: 'beta' } }); }
it('rejects tenant administrators without PlatformAdmin access', async () => {
  tenantApi.login.mockResolvedValue({ token: 'token', user: { isPlatformAdmin: false } }); render(<App/>);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'tenant@test.local' } }); fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'password' } }); fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Platform Admin'); expect(localStorage.getItem('oneportal.tenant.token')).toBeNull();
});
it('creates a company with the chosen application and existing administrator', async () => {
  tenantApi.create.mockResolvedValue({}); await companyForm(); fireEvent.change(screen.getByLabelText('Email quản trị viên đã có'), { target: { value: 'admin@test.local' } }); fireEvent.click(screen.getByRole('button', { name: 'Tạo công ty' }));
  await waitFor(() => expect(tenantApi.create).toHaveBeenCalledWith({ key: 'beta', name: 'Beta', applications: ['quoting'], adminEmail: 'admin@test.local' })); expect(await screen.findByText('Đã tạo công ty và khởi tạo dữ liệu nền tảng.')).toBeInTheDocument();
});
it('preserves company fields on failure and permits a retry', async () => {
  tenantApi.create.mockRejectedValue(new Error('Không thể khởi tạo')); await companyForm(); fireEvent.click(screen.getByRole('button', { name: 'Tạo công ty' })); expect(await screen.findByRole('alert')).toHaveTextContent('Không thể khởi tạo'); expect(screen.getByLabelText('Tên công ty')).toHaveValue('Beta'); expect(screen.getByRole('button', { name: 'Tạo công ty' })).toBeEnabled();
});
it('opens registration for the selected quoting application only', async () => {
  tenantApi.configure.mockResolvedValue({}); await dashboard(); fireEvent.click(screen.getByRole('button', { name: 'Cấu hình', exact: true })); fireEvent.click(screen.getByRole('checkbox', { name: /Cho phép tự đăng ký/ })); fireEvent.click(screen.getByRole('button', { name: 'Lưu cấu hình' }));
  await waitFor(() => expect(tenantApi.configure).toHaveBeenCalledWith('company-a', 'quoting', { isEnabled: true, allowSelfRegistration: true }));
});
it('creates an identity and chosen app membership in one action', async () => {
  tenantApi.createMember.mockResolvedValue({}); await dashboard(); fireEvent.click(screen.getByRole('button', { name: 'Thêm người dùng' }));
  const modal = within(screen.getByRole('dialog')); expect(modal.getByText('Acme')).toBeInTheDocument();
  fireEvent.change(modal.getByLabelText('Họ tên'), { target: { value: 'New User' } }); fireEvent.change(modal.getByLabelText('Email'), { target: { value: 'new@test.local' } }); fireEvent.change(modal.getByLabelText('Mật khẩu ban đầu'), { target: { value: 'synthetic-password' } }); fireEvent.click(modal.getByRole('button', { name: 'Tạo & cấp quyền' }));
  await waitFor(() => expect(tenantApi.createMember).toHaveBeenCalledWith('company-a', 'quoting', { fullName: 'New User', email: 'new@test.local', password: 'synthetic-password', role: 'User' })); await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});
it('grants existing accounts without sending a password or profile', async () => {
  tenantApi.setMember.mockResolvedValue({}); await dashboard(); fireEvent.click(screen.getByRole('button', { name: 'Thêm người dùng' })); fireEvent.click(screen.getByRole('button', { name: 'Tài khoản đã có' }));
  expect(screen.queryByLabelText('Mật khẩu ban đầu')).not.toBeInTheDocument(); fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'existing@test.local' } }); fireEvent.click(screen.getByRole('button', { name: 'Cấp quyền', exact: true }));
  await waitFor(() => expect(tenantApi.setMember).toHaveBeenCalledWith('company-a', 'quoting', { email: 'existing@test.local', role: 'User', isActive: true })); expect(tenantApi.createMember).not.toHaveBeenCalled();
});
it('keeps new user fields and displays server conflict errors', async () => {
  tenantApi.createMember.mockRejectedValue(new Error('Email đã có tài khoản.')); await dashboard(); fireEvent.click(screen.getByRole('button', { name: 'Thêm người dùng' })); fireEvent.change(screen.getByLabelText('Họ tên'), { target: { value: 'Keep Me' } }); fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'duplicate@test.local' } }); fireEvent.change(screen.getByLabelText('Mật khẩu ban đầu'), { target: { value: 'synthetic-password' } }); fireEvent.click(screen.getByRole('button', { name: 'Tạo & cấp quyền' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Email đã có'); expect(screen.getByLabelText('Họ tên')).toHaveValue('Keep Me'); expect(screen.getByRole('button', { name: 'Tạo & cấp quyền' })).toBeEnabled();
});
it('requires a separate confirmation before locking a company', async () => {
  tenantApi.update.mockResolvedValue({}); await dashboard(); fireEvent.click(screen.getByRole('button', { name: 'Cấu hình', exact: true })); fireEvent.click(screen.getByRole('button', { name: 'Khóa công ty' })); expect(tenantApi.update).not.toHaveBeenCalled(); fireEvent.click(screen.getByRole('button', { name: 'Xác nhận khóa' })); await waitFor(() => expect(tenantApi.update).toHaveBeenCalledWith('company-a', { name: 'Acme', isActive: false }));
});
it('searches companies through the server after typing', async () => {
  await dashboard(); fireEvent.change(screen.getByLabelText('Tìm công ty'), { target: { value: 'acme' } }); await waitFor(() => expect(tenantApi.list).toHaveBeenLastCalledWith(1, expect.any(AbortSignal), 'acme'));
});

it('selects an enabled Landing app when the first company has no Quoting app', async () => {
  tenantApi.list.mockResolvedValue({ items: [{ ...tenant, applications: [{ appKey:'landing', isEnabled:true, provisioningStatus:'Ready' }] }] }); await dashboard(); expect(screen.getByRole('button', { name:'Landing Page', exact:true })).toHaveAttribute('aria-pressed', 'true'); await waitFor(() => expect(tenantApi.members).toHaveBeenCalledWith('company-a', 'landing', 1, expect.any(AbortSignal)));
});
