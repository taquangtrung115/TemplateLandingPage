import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SupportBoardPage from '../src/pages/support/SupportBoardPage';
import { quotingSupportApi } from '../src/api/quotingSupportApi';
const auth = vi.hoisted(() => ({ isAdmin: true }));
vi.mock('../src/contexts/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../src/api/quotingSupportApi', () => ({ quotingSupportApi: { searchRequests: vi.fn(), changeStatus: vi.fn() } }));
const request = { id: 'request-1', fullName: 'Nguyễn Thị Hồng', email: 'hong@example.test', phone: '0901234567', topic: 'Lỗi PDF tiếng Việt', message: 'Dấu tiếng Việt bị lệch khi xuất báo giá.', priority: 'urgent', status: 'New', revision: 0, createdAtUtc: '2026-11-08T00:00:00Z' };
beforeEach(() => {
  vi.clearAllMocks(); auth.isAdmin = true;
  quotingSupportApi.searchRequests.mockImplementation(async ({ status }) => ({ data: status === 'New' ? [request] : [], total: status === 'New' ? 1 : 0, page: 1, pageSize: 20 }));
  quotingSupportApi.changeStatus.mockResolvedValue({ request: { ...request, status: 'InProgress', revision: 1 } });
});
describe('Support processing board', () => {
  it('shows real requests in three status columns, contact and priority', async () => {
    render(<SupportBoardPage />);
    expect(await screen.findByText(request.topic)).toBeInTheDocument();
    expect(screen.getAllByRole('region')).toHaveLength(3);
    expect(within(screen.getByRole('region', { name: 'Mới', exact: true })).getByText('Khẩn cấp')).toBeInTheDocument(); expect(screen.getByText(request.email)).toBeInTheDocument();
    expect(quotingSupportApi.searchRequests).toHaveBeenCalledWith(expect.objectContaining({ status: 'Resolved', pageSize: 20 }));
  });
  it('loads no private data for a non-admin', () => {
    auth.isAdmin = false; render(<SupportBoardPage />);
    expect(screen.getByText('Không có quyền truy cập')).toBeInTheDocument(); expect(quotingSupportApi.searchRequests).not.toHaveBeenCalled();
  });
  it('changes status with the saved revision and prevents double clicks', async () => {
    let resolve; quotingSupportApi.changeStatus.mockImplementation(() => new Promise((r) => { resolve = r; }));
    render(<SupportBoardPage />); const button = await screen.findByRole('button', { name: 'Bắt đầu xử lý' }); fireEvent.click(button); fireEvent.click(button);
    expect(quotingSupportApi.changeStatus).toHaveBeenCalledExactlyOnceWith(request.id, 'InProgress', 0);
    resolve({ request: { ...request, status: 'InProgress', revision: 1 } }); await waitFor(() => expect(quotingSupportApi.searchRequests.mock.calls.length).toBeGreaterThan(3));
  });
  it('keeps the request visible when a transition fails', async () => {
    quotingSupportApi.changeStatus.mockRejectedValue(new Error('Không thể lưu trạng thái'));
    render(<SupportBoardPage />); fireEvent.click(await screen.findByRole('button', { name: 'Đánh dấu đã xử lý' }));
    await waitFor(() => expect(quotingSupportApi.changeStatus).toHaveBeenCalled()); expect(screen.getByText(request.topic)).toBeInTheDocument();
  });
  it('opens the full message in an Astryx drawer', async () => {
    render(<SupportBoardPage />); fireEvent.click(await screen.findByRole('button', { name: 'Xem chi tiết' }));
    const drawer = await screen.findByRole('dialog', { name: 'Chi tiết yêu cầu hỗ trợ' });
    expect(within(drawer).getByText(request.message)).toBeInTheDocument(); expect(within(drawer).getByText('Điện thoại: 0901234567')).toBeInTheDocument();
  });
  it('shows retry after loading fails without fabricating requests', async () => {
    quotingSupportApi.searchRequests.mockRejectedValueOnce(new Error('API tạm ngừng'));
    render(<SupportBoardPage />); expect(await screen.findByText('API tạm ngừng')).toBeInTheDocument(); expect(screen.queryByText(request.topic)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tải lại' })); expect(await screen.findByText(request.topic)).toBeInTheDocument();
  });
  it('searches on the server after typing', async () => {
    render(<SupportBoardPage />); await screen.findByText(request.topic);
    fireEvent.change(screen.getByLabelText('Tìm yêu cầu hỗ trợ'), { target: { value: 'tiếng Việt' } });
    await waitFor(() => expect(quotingSupportApi.searchRequests).toHaveBeenCalledWith(expect.objectContaining({ searchTerm: 'tiếng Việt', page: 1 })));
  });
});
