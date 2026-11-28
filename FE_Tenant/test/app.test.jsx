import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { beforeEach, it, expect, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import AppRoutes from '../src/routes/AppRoutes';
import { tenantApi } from '../src/api/tenantApi';
vi.mock('../src/api/tenantApi', () => ({ tenantApi: { login: vi.fn(), me: vi.fn(), list: vi.fn(), detail: vi.fn(), detailByKey: vi.fn(), create: vi.fn(), update: vi.fn(),
  configure: vi.fn(), users: vi.fn(), setMember: vi.fn(), createMember: vi.fn(), uninstall: vi.fn(), remove: vi.fn(), removeMember: vi.fn(),
  updateMemberProfile: vi.fn(), setWorkspaceMember: vi.fn() } }));
const tenant = { id: 'company-a', key: 'acme', name: 'Acme', isActive: true, applications: [{ appKey: 'quoting', isEnabled: true, allowSelfRegistration: false, provisioningStatus: 'Ready', seedVersion: 1 }] };
beforeEach(() => {
  vi.clearAllMocks(); tenantApi.list.mockResolvedValue({ items: [tenant] });
  tenantApi.detail.mockResolvedValue(tenant); tenantApi.detailByKey.mockResolvedValue(tenant);
  tenantApi.users.mockResolvedValue({ items: [], totalCount: 0, pageSize: 20 }); tenantApi.me.mockResolvedValue({ id: 'admin', isPlatformAdmin: true });
});
function CurrentPath() { return <output data-testid="path">{useLocation().pathname}</output>; }
function renderApp(path = '/') { return render(<MemoryRouter initialEntries={[path]}><AppRoutes /><CurrentPath /></MemoryRouter>); }
async function dashboard() { localStorage.setItem('oneportal.tenant.token', 'test-token'); renderApp('/tenants/acme/members'); await screen.findByRole('heading', { name: 'Acme' }); await screen.findByText('Chưa có người dùng'); }
async function companyForm() { await dashboard(); fireEvent.click(screen.getByRole('button', { name: 'Thêm công ty' })); fireEvent.change(screen.getByLabelText('Tên công ty'), { target: { value: 'Beta' } }); fireEvent.change(screen.getByLabelText('Mã workspace'), { target: { value: 'beta' } }); }
it('rejects tenant administrators without PlatformAdmin access', async () => {
  tenantApi.login.mockResolvedValue({ token: 'token', user: { isPlatformAdmin: false } }); renderApp();
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'tenant@test.local' } }); fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'password' } }); fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Platform Admin'); expect(localStorage.getItem('oneportal.tenant.token')).toBeNull();
});
it('creates a company with the chosen application and existing administrator', async () => {
  tenantApi.create.mockResolvedValue({ tenant: { ...tenant, id: 'company-b', key: 'beta', name: 'Beta' } }); await companyForm(); fireEvent.change(screen.getByLabelText('Email quản trị viên đã có'), { target: { value: 'admin@test.local' } }); fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Tạo công ty' }));
  await waitFor(() => expect(tenantApi.create).toHaveBeenCalledWith({ key: 'beta', name: 'Beta', applications: ['quoting'], adminEmail: 'admin@test.local' })); expect(await screen.findByText('Đã tạo công ty và khởi tạo dữ liệu nền tảng.')).toBeInTheDocument();
});
it('preserves company fields on failure and permits a retry', async () => {
  tenantApi.create.mockRejectedValue(new Error('Không thể khởi tạo')); await companyForm(); const modal = within(screen.getByRole('dialog')); fireEvent.click(modal.getByRole('button', { name: 'Tạo công ty' })); expect(await screen.findByRole('alert')).toHaveTextContent('Không thể khởi tạo'); expect(screen.getByLabelText('Tên công ty')).toHaveValue('Beta'); expect(modal.getByRole('button', { name: 'Tạo công ty' })).toBeEnabled();
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
  const landing = { ...tenant, applications: [{ appKey:'landing', isEnabled:true, provisioningStatus:'Ready' }] };
  tenantApi.list.mockResolvedValue({ items: [landing] }); tenantApi.detailByKey.mockResolvedValue(landing);
  await dashboard();
  expect(screen.getByRole('button', { name:'Landing Page', exact:true })).toHaveAttribute('aria-pressed', 'true');
  await waitFor(() => expect(tenantApi.users).toHaveBeenCalledWith('company-a', 1, '', expect.any(AbortSignal)));
});

it('opens a legacy Store link, highlights the route and focuses command search', async () => {
  localStorage.setItem('oneportal.tenant.token', 'test-token');
  renderApp('/?tenant=acme&view=store');
  await screen.findByRole('heading', { name: 'Store ứng dụng' });
  expect(screen.getByTestId('path')).toHaveTextContent('/tenants/acme/apps');
  const nav = within(screen.getByRole('navigation', { name: 'Điều hướng quản trị' }));
  expect(nav.getByRole('link', { name: 'App Store' })).toHaveAttribute('aria-current', 'page');
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
  expect(screen.getByLabelText('Tìm công ty')).toHaveFocus();
  fireEvent.click(nav.getByRole('link', { name: 'Quản lý User' }));
  expect(screen.getByTestId('path')).toHaveTextContent('/tenants/acme/members');
});

it('uninstalls only the selected app after confirmation', async () => {
  tenantApi.uninstall.mockResolvedValue({ tenant });
  await dashboard();
  fireEvent.click(screen.getByRole('button', { name: 'Store' }));
  fireEvent.click(screen.getByRole('button', { name: 'Gỡ cài đặt' }));
  const dialog = within(screen.getByRole('dialog'));
  fireEvent.click(dialog.getByRole('checkbox'));
  fireEvent.click(dialog.getByRole('button', { name: 'Xác nhận gỡ cài đặt' }));
  await waitFor(() => expect(tenantApi.uninstall).toHaveBeenCalledWith('company-a', 'quoting', true));
});

it('requires the exact workspace key before sending a tenant deletion', async () => {
  await dashboard();
  fireEvent.click(screen.getByRole('button', { name: 'Cấu hình', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Xóa công ty', exact: true }));
  const dialog = within(screen.getByRole('dialog'));
  const confirm = dialog.getByRole('button', { name: 'Xác nhận xóa công ty' });
  expect(confirm).toBeDisabled();
  fireEvent.change(dialog.getByLabelText('Nhập lại mã workspace'), { target: { value: 'acme' } });
  expect(confirm).toBeEnabled();
  fireEvent.click(confirm);
  await waitFor(() => expect(tenantApi.remove).toHaveBeenCalledWith('company-a', { confirmKey: 'acme', force: false }));
});

it('edits an inherited role independently from an app override and can remove the override', async () => {
  localStorage.setItem('oneportal.tenant.token', 'test-token');
  tenantApi.users.mockResolvedValue({ pageSize: 20, totalCount: 1, items: [{
    id: 'person-a', email: 'member@test.local', fullName: 'Member', accountIsActive: true, workspaceRole: 'User',
    applications: [{ appKey: 'quoting', role: 'Admin', isActive: true }],
  }] });
  renderApp('/tenants/acme/members');
  const effective = await screen.findByRole('combobox', { name: 'Quoting của member@test.local' });
  expect(effective).toHaveValue('Admin');
  expect(screen.getByRole('combobox', { name: 'Quyền công ty của member@test.local' })).toHaveValue('User');
  fireEvent.click(screen.getByRole('button', { name: 'Gỡ quyền Quoting của member@test.local' }));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Xác nhận gỡ quyền' }));
  await waitFor(() => expect(tenantApi.removeMember).toHaveBeenCalledWith('company-a', 'quoting', 'person-a'));
});
