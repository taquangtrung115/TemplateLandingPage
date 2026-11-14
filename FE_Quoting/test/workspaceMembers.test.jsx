import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkspaceMembers from '../src/components/WorkspaceMembers';
import { workspaceApi } from '../src/api/workspaceApi';
vi.mock('../src/api/workspaceApi', () => ({ workspaceApi: { members: vi.fn(), setMember: vi.fn(), createMember: vi.fn() } }));
beforeEach(() => { vi.clearAllMocks(); workspaceApi.members.mockResolvedValue({ items: [] }); workspaceApi.setMember.mockResolvedValue({}); });
it('grants application membership through the scoped API', async () => {
  render(<WorkspaceMembers/>); await screen.findByText('Chưa có thành viên.'); fireEvent.click(screen.getByRole('button', { name: 'Tài khoản đã có' }));
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@test.local' } });
  fireEvent.change(screen.getByLabelText('Vai trò'), { target: { value: 'Admin' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cấp quyền' }));
  await waitFor(() => expect(workspaceApi.setMember).toHaveBeenCalledWith({ email: 'user@test.local', role: 'Admin', isActive: true }));
});
it('preserves the input and displays a failed grant', async () => {
  workspaceApi.setMember.mockRejectedValue(new Error('Tài khoản chưa tồn tại')); render(<WorkspaceMembers/>); await screen.findByText('Chưa có thành viên.'); fireEvent.click(screen.getByRole('button', { name: 'Tài khoản đã có' }));
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'missing@test.local' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cấp quyền' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Tài khoản chưa tồn tại');
  expect(screen.getByLabelText('Email')).toHaveValue('missing@test.local');
});

it('creates an account and membership together and clears the password after success', async () => {
  workspaceApi.createMember.mockResolvedValue({}); render(<WorkspaceMembers/>); await screen.findByText('Chưa có thành viên.');
  fireEvent.change(screen.getByLabelText('Họ tên'), { target: { value: 'New Member' } }); fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@test.local' } }); fireEvent.change(screen.getByLabelText('Mật khẩu ban đầu'), { target: { value: 'Synthetic-123!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Tạo & cấp quyền' })); await waitFor(() => expect(workspaceApi.createMember).toHaveBeenCalledWith({ fullName: 'New Member', email: 'new@test.local', password: 'Synthetic-123!', role: 'User' })); await waitFor(() => expect(screen.getByLabelText('Mật khẩu ban đầu')).toHaveValue(''));
});
