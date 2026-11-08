import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TemplateListPage from '../src/pages/templates/TemplateListPage';
import { quotingTemplateApi } from '../src/api/quotingTemplateApi';
import { template } from './fixtures';
const auth = vi.hoisted(() => ({ isAdmin: true }));
vi.mock('../src/contexts/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../src/api/quotingTemplateApi', () => ({ quotingTemplateApi: { getTemplates: vi.fn(), createVersion: vi.fn(), createTemplate: vi.fn() } }));
beforeEach(() => {
  vi.clearAllMocks(); auth.isAdmin = true;
  quotingTemplateApi.getTemplates.mockResolvedValue([template]);
  quotingTemplateApi.createVersion.mockResolvedValue(2);
  quotingTemplateApi.createTemplate.mockResolvedValue('new-template-id');
});
async function open() {
  render(<TemplateListPage />);
  await waitFor(() => expect(screen.getByLabelText('Tên đơn vị bán hàng')).toHaveValue('Đơn vị bán hàng'));
}

describe('Versioned quotation templates', () => {
  it('hydrates the form from the persisted version instead of hardcoded company details', async () => {
    await open();
    fireEvent.click(screen.getByText('Tài khoản thanh toán'));
    expect(screen.getByLabelText('Số tài khoản ngân hàng')).toHaveValue('123456');
    expect(screen.getByLabelText('Chủ tài khoản')).toHaveValue('Chủ tài khoản');
  });
  it('publishes the current selection and preserves unrelated JSON settings', async () => {
    await open();
    fireEvent.change(screen.getByLabelText('Tên đơn vị bán hàng'), { target: { value: 'Tên mới' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu phiên bản mới' }));
    await waitFor(() => expect(quotingTemplateApi.createVersion).toHaveBeenCalledWith(template.id, expect.any(Object)));
    const payload = quotingTemplateApi.createVersion.mock.calls[0][1];
    expect(JSON.parse(payload.sellerInfoJson).companyName).toBe('Tên mới');
    expect(JSON.parse(payload.paymentTermsJson)).toMatchObject({ retainedSetting: true, bankAccounts: [expect.objectContaining({ accountNumber: '123456' })] });
    expect(payload.columnsConfigJson).toBe(template.versions[0].columnsConfigJson);
    expect(payload.signatureConfigJson).toBe(template.versions[0].signatureConfigJson);
  });
  it('creates an independent template through a drawer', async () => {
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm mẫu' }));
    expect(screen.getByRole('dialog', { name: 'Thêm mẫu báo giá' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Mã mẫu'), { target: { value: 'BG-RIENG' } });
    fireEvent.change(screen.getByLabelText('Tên mẫu'), { target: { value: 'Báo giá khách hàng riêng' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo mẫu' }));
    await waitFor(() => expect(quotingTemplateApi.createTemplate).toHaveBeenCalledWith(expect.objectContaining({ code: 'BG-RIENG', name: 'Báo giá khách hàng riêng', isSystem: false, sellerInfoJson: template.versions[0].sellerInfoJson })));
  });
  it('keeps modifications available when a new version cannot be saved', async () => {
    quotingTemplateApi.createVersion.mockRejectedValueOnce(new Error('Phiên bản đã thay đổi. Vui lòng thử lại.'));
    await open(); fireEvent.change(screen.getByLabelText('Tên đơn vị bán hàng'), { target: { value: 'Chưa lưu' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu phiên bản mới' }));
    expect(await screen.findByText('Phiên bản đã thay đổi. Vui lòng thử lại.')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên đơn vị bán hàng')).toHaveValue('Chưa lưu');
  });
  it('shows templates read-only to non-admin users', async () => {
    auth.isAdmin = false; await open();
    expect(screen.getByLabelText('Tên đơn vị bán hàng')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Tên đơn vị bán hàng')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Lưu phiên bản mới' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Thêm mẫu' })).toBeDisabled();
  });
  it('does not hide load errors with demo template data', async () => {
    quotingTemplateApi.getTemplates.mockRejectedValueOnce(new Error('Không thể tải mẫu từ máy chủ'));
    render(<TemplateListPage />);
    expect(await screen.findByText('Không thể tải mẫu từ máy chủ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lưu phiên bản mới' })).toBeDisabled();
  });
});
