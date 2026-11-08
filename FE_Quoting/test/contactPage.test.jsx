import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactPage from '../src/pages/contact/ContactPage';
import { quotingSupportApi } from '../src/api/quotingSupportApi';
vi.mock('../src/api/quotingSupportApi', () => ({ quotingSupportApi: { submitRequest: vi.fn() } }));
beforeEach(() => { vi.clearAllMocks(); quotingSupportApi.submitRequest.mockResolvedValue({ id: 'support-123' }); });
function fill() {
  fireEvent.change(screen.getByLabelText('Họ và tên'), { target: { value: 'Người liên hệ' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.test' } });
  fireEvent.change(screen.getByLabelText('Nội dung yêu cầu chi tiết'), { target: { value: 'Cần hỗ trợ mẫu báo giá' } });
}
describe('Contact form persists real requests', () => {
  it('validates required fields without calling the API', () => {
    render(<ContactPage />); fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));
    expect(screen.getByText('Vui lòng nhập họ tên')).toBeInTheDocument();
    expect(quotingSupportApi.submitRequest).not.toHaveBeenCalled();
  });
  it('shows success only after the server returns a saved request ID', async () => {
    render(<ContactPage />); fill(); fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));
    expect(await screen.findByText('support-123')).toBeInTheDocument();
    expect(quotingSupportApi.submitRequest).toHaveBeenCalledWith(expect.objectContaining({ fullName: 'Người liên hệ', email: 'user@example.test', message: 'Cần hỗ trợ mẫu báo giá' }));
  });
  it('preserves the message when persistence fails', async () => {
    quotingSupportApi.submitRequest.mockRejectedValueOnce(new Error('Chưa lưu được yêu cầu'));
    render(<ContactPage />); fill(); fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));
    expect(await screen.findByText('Chưa lưu được yêu cầu')).toBeInTheDocument();
    expect(screen.getByLabelText('Nội dung yêu cầu chi tiết')).toHaveValue('Cần hỗ trợ mẫu báo giá');
    expect(screen.queryByText('support-123')).not.toBeInTheDocument();
  });
  it('rejects a response without a request ID', async () => {
    quotingSupportApi.submitRequest.mockResolvedValueOnce({});
    render(<ContactPage />); fill(); fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));
    expect(await screen.findByText('Máy chủ chưa trả về mã yêu cầu hợp lệ.')).toBeInTheDocument();
  });
  it('prevents duplicate sends while waiting', async () => {
    quotingSupportApi.submitRequest.mockReturnValue(new Promise(() => {}));
    render(<ContactPage />); fill(); const button = screen.getByRole('button', { name: 'Gửi yêu cầu' }); fireEvent.click(button); fireEvent.click(button);
    expect(quotingSupportApi.submitRequest).toHaveBeenCalledOnce();
  });
});
