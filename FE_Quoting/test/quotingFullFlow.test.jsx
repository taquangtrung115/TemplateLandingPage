import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import QuotationDetailPage from '../src/pages/quotations/QuotationDetailPage';
import { quotation, quotationId } from './fixtures';
import { quotationApi } from '../src/api/quotationApi';
import { downloadBlob } from '../src/utils/downloadFile';

const navigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async () => ({ ...await vi.importActual('react-router-dom'), useNavigate: () => navigate }));
vi.mock('../src/utils/downloadFile', () => ({ downloadBlob: vi.fn() }));
vi.mock('../src/api/quotationApi', () => ({ quotationApi: { getQuotationById: vi.fn(), previewQuotation: vi.fn(), changeStatus: vi.fn(), exportFile: vi.fn(), downloadFile: vi.fn(), deleteQuotation: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  quotationApi.getQuotationById.mockResolvedValue(quotation);
  quotationApi.previewQuotation.mockResolvedValue({ htmlContent: '<h1>BẢNG BÁO GIÁ</h1>' });
  quotationApi.changeStatus.mockResolvedValue({ isSuccess: true });
  quotationApi.exportFile.mockResolvedValue({ id: 'file-id', fileName: 'Bao-gia.pdf', fileType: 'pdf' });
  quotationApi.downloadFile.mockResolvedValue(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));
  quotationApi.deleteQuotation.mockResolvedValue({ isSuccess: true });
});
async function open() {
  render(<MemoryRouter initialEntries={[`/quotations/${quotationId}`]}><Routes><Route path="/quotations/:id" element={<QuotationDetailPage />} /></Routes></MemoryRouter>);
  await screen.findByRole('heading', { name: quotation.quotationNumber });
}

describe('Saved quotation operations', () => {
  it('isolates the HTML preview from scripts and exposes saved template version', async () => {
    await open();
    expect(screen.getByTitle('Bản xem trước báo giá')).toHaveAttribute('sandbox', '');
    expect(screen.getByText('Mẫu v1')).toBeInTheDocument();
  });
  it.each(['Draft', 'Sent', 'Approved', 'Rejected', 'Cancelled'])('shows controls consistent with status %s', async (status) => {
    quotationApi.getQuotationById.mockResolvedValue({ ...quotation, status });
    await open();
    expect(Boolean(screen.queryByRole('button', { name: 'Sửa báo giá' }))).toBe(status === 'Draft');
    expect(Boolean(screen.queryByRole('button', { name: 'Đánh dấu đã gửi' }))).toBe(status === 'Draft');
    expect(Boolean(screen.queryByRole('button', { name: 'Phê duyệt' }))).toBe(status === 'Sent');
  });
  it('sends a flat string status with a reason after confirmation', async () => {
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Đánh dấu đã gửi' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText(/Chỉ cập nhật trạng thái/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Đánh dấu đã gửi' }));
    await waitFor(() => expect(quotationApi.changeStatus).toHaveBeenCalledWith(quotationId, 'Sent', expect.any(String)));
  });
  it('does not change status when the dialog is cancelled', async () => {
    await open(); fireEvent.click(screen.getByRole('button', { name: 'Đánh dấu đã gửi' }));
    fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Hủy' }));
    expect(quotationApi.changeStatus).not.toHaveBeenCalled();
  });
  it.each(['pdf', 'html'])('exports and downloads %s through the authenticated API', async (format) => {
    await open();
    fireEvent.click(screen.getAllByRole('button', { name: format === 'pdf' ? 'Tải PDF' : 'Tải HTML' })[0]);
    await waitFor(() => expect(quotationApi.exportFile).toHaveBeenCalledWith(quotationId, format));
    await waitFor(() => expect(quotationApi.downloadFile).toHaveBeenCalledWith(quotationId, 'file-id'));
    expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'Bao-gia.pdf');
  });
  it('updates preview and export VAT without updating the saved quotation', async () => {
    await open();
    const toggle = screen.getByRole('switch', { name: 'Thêm VAT khi xuất' });
    if (toggle.checked) fireEvent.click(toggle);
    else { fireEvent.click(toggle); await waitFor(() => expect(quotationApi.previewQuotation).toHaveBeenLastCalledWith(quotationId, 10)); fireEvent.click(toggle); }
    await waitFor(() => expect(quotationApi.previewQuotation).toHaveBeenLastCalledWith(quotationId, 0));
    fireEvent.click(screen.getAllByRole('button', { name: 'Tải PDF' })[0]);
    await waitFor(() => expect(quotationApi.exportFile).toHaveBeenCalledWith(quotationId, 'pdf', 0));
    expect(quotation.taxPercent).toBe(0);
  });
  it('blocks export after an option preview fails until a valid preview is restored', async () => {
    await open();
    quotationApi.previewQuotation.mockRejectedValueOnce(new Error('Chưa thể xem trước VAT'));
    fireEvent.click(screen.getByRole('switch', { name: 'Thêm VAT khi xuất' }));
    expect(await screen.findByText('Chưa thể xem trước VAT')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Tải PDF' })[0]);
    expect(quotationApi.exportFile).not.toHaveBeenCalled();
  });
  it('never reports a downloaded file when export fails', async () => {
    quotationApi.exportFile.mockRejectedValueOnce(new Error('Không thể xuất tệp'));
    await open(); fireEvent.click(screen.getAllByRole('button', { name: 'Tải PDF' })[0]);
    await waitFor(() => expect(quotationApi.exportFile).toHaveBeenCalledOnce());
    expect(quotationApi.downloadFile).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });
  it('keeps details usable when only preview fails', async () => {
    quotationApi.previewQuotation.mockRejectedValueOnce(new Error('Preview unavailable'));
    await open(); expect(screen.getByText(/Chưa tải được bản xem trước/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sửa báo giá' })).toBeEnabled();
  });
  it('turns a 404 into an error and retry action instead of an infinite skeleton', async () => {
    quotationApi.getQuotationById.mockRejectedValueOnce(new Error('Báo giá không tồn tại'));
    render(<MemoryRouter><QuotationDetailPage /></MemoryRouter>);
    expect(await screen.findByText('Báo giá không tồn tại')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('heading', { name: quotation.quotationNumber })).toBeInTheDocument();
  });
  it('deletes only after an explicit confirmation', async () => {
    await open(); fireEvent.click(screen.getByRole('button', { name: 'Xóa báo giá' }));
    expect(quotationApi.deleteQuotation).not.toHaveBeenCalled();
    fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Xóa báo giá' }));
    await waitFor(() => expect(quotationApi.deleteQuotation).toHaveBeenCalledWith(quotationId));
    expect(navigate).toHaveBeenCalledWith('/quotations');
  });
  it('opens the draft editor through its route', async () => {
    await open(); fireEvent.click(screen.getByRole('button', { name: 'Sửa báo giá' }));
    expect(navigate).toHaveBeenCalledWith(`/quotations/${quotationId}/edit`);
  });
});
