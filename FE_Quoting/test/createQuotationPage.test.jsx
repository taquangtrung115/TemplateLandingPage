import { groups } from './fixtures';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CreateQuotationPage from '../src/pages/quotations/CreateQuotationPage';
import { customer, product, template, quotation, quotationId } from './fixtures';
import { quotationApi } from '../src/api/quotationApi';
import { quotingCustomerApi } from '../src/api/quotingCustomerApi';
import { quotingProductApi } from '../src/api/quotingProductApi';
import { quotingTemplateApi } from '../src/api/quotingTemplateApi';

const navigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async () => ({ ...await vi.importActual('react-router-dom'), useNavigate: () => navigate }));
vi.mock('../src/api/quotationApi', () => ({ quotationApi: { createQuotation: vi.fn(), updateQuotation: vi.fn(), getQuotationById: vi.fn(), previewDraft: vi.fn(async () => ({ htmlContent: '<h1>BÁO GIÁ</h1>' })) } }));
vi.mock('../src/api/quotingCustomerApi', () => ({ quotingCustomerApi: { getCustomers: vi.fn() } }));
vi.mock('../src/api/quotingProductGroupApi', () => ({ quotingProductGroupApi: { getGroups: vi.fn(async () => (await import('./fixtures')).groups) } }));
vi.mock('../src/api/quotingProductApi', () => ({ quotingProductApi: { getProducts: vi.fn() } }));
vi.mock('../src/api/quotingTemplateApi', () => ({ quotingTemplateApi: { getTemplates: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  quotingCustomerApi.getCustomers.mockResolvedValue([customer]);
  quotingProductApi.getProducts.mockResolvedValue([product]);
  quotingTemplateApi.getTemplates.mockResolvedValue([template]);
  quotationApi.createQuotation.mockResolvedValue(quotationId);
  quotationApi.updateQuotation.mockResolvedValue({ isSuccess: true });
  quotationApi.getQuotationById.mockResolvedValue(quotation);
});

async function openEditor(edit = false) {
  render(<MemoryRouter initialEntries={[edit ? `/quotations/${quotationId}/edit` : '/quotations/create']}><Routes><Route path="/quotations/create" element={<CreateQuotationPage />} /><Route path="/quotations/:id/edit" element={<CreateQuotationPage />} /></Routes></MemoryRouter>);
  await screen.findByRole('heading', { name: 'Tóm tắt báo giá' });
}
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
async function addProduct() {
  next();
  await screen.findByRole('heading', { name: 'Bước 2: Sản phẩm và đơn giá' });
  fireEvent.click(screen.getByRole('button', { name: /^Thêm theo nhóm sản phẩm/ }));
  fireEvent.click(await screen.findByRole('option', { name: groups[0].name }));
}
function confirm() { next(); next(); }

describe('Quotation editor business flows', () => {
  it('starts empty and uses a distinct catalog price and editable quotation price', async () => {
    await openEditor(); await addProduct();
    expect(screen.getByLabelText(`Đơn giá báo giá (VNĐ) ${product.name}`)).toHaveValue('18000');
    fireEvent.change(screen.getByLabelText(`Đơn giá báo giá (VNĐ) ${product.name}`), { target: { value: '20000' } });
    fireEvent.blur(screen.getByLabelText(`Đơn giá báo giá (VNĐ) ${product.name}`));
    expect(screen.getByText(/Giá danh mục: 18/)).toBeInTheDocument();
    expect(product.price).toBe(18000);
  });
  it('submits the real GUID response and preserves a custom customer price', async () => {
    await openEditor();
    fireEvent.click(screen.getByRole('switch', { name: /Bỏ qua chọn khách hàng/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Khách hàng nhận báo giá/ }));
    fireEvent.click(await screen.findByRole('option', { name: new RegExp(customer.name) }));
    await addProduct();
    fireEvent.change(screen.getByLabelText(`Đơn giá báo giá (VNĐ) ${product.name}`), { target: { value: '20000' } });
    fireEvent.blur(screen.getByLabelText(`Đơn giá báo giá (VNĐ) ${product.name}`));
    confirm(); fireEvent.click(screen.getByRole('button', { name: 'Tạo báo giá' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(`/quotations/${quotationId}`));
    expect(quotationApi.createQuotation).toHaveBeenCalledWith(expect.objectContaining({ customerId: customer.id, templateId: template.id, items: [expect.objectContaining({ productId: product.id, unitPrice: 20000 })] }));
  });
  it('allows a generic quotation with no customer details', async () => {
    await openEditor();

    await addProduct(); confirm();
    fireEvent.click(screen.getByRole('button', { name: 'Tạo báo giá' }));
    await waitFor(() => expect(quotationApi.createQuotation).toHaveBeenCalled());
    expect(quotationApi.createQuotation.mock.calls[0][0].customerId).toBeNull();
    expect(quotationApi.createQuotation.mock.calls[0][0].taxPercent).toBe(0);
  });
  it('adds VAT only after selecting the option and drops it when turned off', async () => {
    await openEditor(); await addProduct(); next();
    expect(screen.queryByLabelText('Thuế suất VAT (%)')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Thêm VAT', exact: true }));
    const tax = screen.getByLabelText('Thuế suất VAT (%)');
    fireEvent.change(tax, { target: { value: '8' } }); fireEvent.blur(tax);
    fireEvent.click(screen.getByRole('switch', { name: 'Thêm VAT', exact: true }));
    next(); fireEvent.click(screen.getByRole('button', { name: 'Tạo báo giá' }));
    await waitFor(() => expect(quotationApi.createQuotation).toHaveBeenCalled());
    expect(quotationApi.createQuotation.mock.calls[0][0].taxPercent).toBe(0);
  });
  it('adds a group idempotently without changing quantities', async () => {
    await openEditor(); await addProduct();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm cả nhóm' }));
    expect(screen.getAllByLabelText(`Đơn giá báo giá (VNĐ) ${product.name}`)).toHaveLength(1);
    expect(screen.queryByLabelText(`Số lượng ${product.name}`)).not.toBeInTheDocument();
  });
  it('requires at least one selected item before review', async () => {
    await openEditor(); next(); next();
    expect(screen.getByText('Thêm ít nhất một sản phẩm vào báo giá.')).toBeInTheDocument();
    expect(quotationApi.createQuotation).not.toHaveBeenCalled();
  });
  it('does not manufacture customer, product or template records for an empty database', async () => {
    quotingCustomerApi.getCustomers.mockResolvedValue([]);
    quotingProductApi.getProducts.mockResolvedValue([]);
    quotingTemplateApi.getTemplates.mockResolvedValue([]);
    await openEditor();
    expect(screen.queryByText(product.name)).not.toBeInTheDocument();
 next();
    expect(screen.getByText(/Chưa có mẫu báo giá. Vui lòng liên hệ/)).toBeInTheDocument();
    expect(quotationApi.createQuotation).not.toHaveBeenCalled();
  });
  it('shows a recoverable load failure without fake seed data', async () => {
    quotingProductApi.getProducts.mockRejectedValueOnce(new Error('Máy chủ tạm ngừng'));
    render(<MemoryRouter><CreateQuotationPage /></MemoryRouter>);
    expect(await screen.findByText('Máy chủ tạm ngừng')).toBeInTheDocument();
    expect(screen.queryByText('COMBO NGUYÊN BẢN BAO NGON')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('heading', { name: 'Tóm tắt báo giá' })).toBeInTheDocument();
  });
  it('keeps input on a failed save and prevents duplicate submission', async () => {
    let reject;
    quotationApi.createQuotation.mockImplementation(() => new Promise((_, rejectPromise) => { reject = rejectPromise; }));
    await openEditor(); await addProduct(); confirm();
    const button = screen.getByRole('button', { name: 'Tạo báo giá' });
    fireEvent.click(button); fireEvent.click(button);
    expect(quotationApi.createQuotation).toHaveBeenCalledOnce();
    reject(new Error('Chưa thể lưu báo giá'));
    expect(await screen.findByText('Chưa thể lưu báo giá')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tạo báo giá' })).toBeEnabled();
  });
  it('rejects a malformed success response instead of navigating to an invalid quotation', async () => {
    quotationApi.createQuotation.mockResolvedValue({ isSuccess: true, value: quotationId });
    await openEditor(); await addProduct(); confirm(); fireEvent.click(screen.getByRole('button', { name: 'Tạo báo giá' }));
    expect(await screen.findByText('Máy chủ chưa trả về mã báo giá hợp lệ.')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });
  it('edits the saved quote price, not the later catalog price', async () => {
    await openEditor(true); next();
    expect(screen.getByLabelText(`Đơn giá báo giá (VNĐ) ${product.name}`)).toHaveValue('12000');
    expect(screen.getByText(/Giá danh mục: 18/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(`Đơn giá báo giá (VNĐ) ${product.name}`), { target: { value: '15000' } });
    fireEvent.blur(screen.getByLabelText(`Đơn giá báo giá (VNĐ) ${product.name}`));
    confirm(); fireEvent.click(screen.getByRole('button', { name: 'Lưu báo giá' }));
    await waitFor(() => expect(quotationApi.updateQuotation).toHaveBeenCalledWith(quotationId, expect.objectContaining({ items: [expect.objectContaining({ unitPrice: 15000 })] })));
    expect(quotationApi.createQuotation).not.toHaveBeenCalled();
  });
  it('retains the quotation template version during a draft edit', async () => {
    quotingTemplateApi.getTemplates.mockResolvedValue([{ ...template, currentVersion: 2, versions: [...template.versions, { ...template.versions[0], version: 2 }] }]);
    await openEditor(true); next(); confirm(); fireEvent.click(screen.getByRole('button', { name: 'Lưu báo giá' }));
    await waitFor(() => expect(quotationApi.updateQuotation).toHaveBeenCalledWith(quotationId, expect.objectContaining({ templateVersion: 1 })));
  });
  it('blocks opening a non-draft for editing', async () => {
    quotationApi.getQuotationById.mockResolvedValue({ ...quotation, status: 'Sent' });
    render(<MemoryRouter initialEntries={[`/quotations/${quotationId}/edit`]}><Routes><Route path="/quotations/:id/edit" element={<CreateQuotationPage />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('Chỉ có thể sửa báo giá ở trạng thái bản nháp.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tiếp tục' })).not.toBeInTheDocument();
  });
  it('defaults all optional pricing sections off and sends those choices to preview and save', async () => {
    await openEditor(); await addProduct();
    for (const label of ['Hiển thị CK (%)', 'Hiển thị Số lượng', 'Hiển thị Tạm tính hàng hóa', 'Hiển thị TỔNG CỘNG'])
      expect(screen.getByRole('switch', { name: label, exact: true })).not.toBeChecked();
    confirm();
    await waitFor(() => expect(quotationApi.previewDraft).toHaveBeenCalled());
    expect(screen.getByTitle('Bản xem trước trước khi tạo')).toHaveAttribute('sandbox', '');
    fireEvent.click(screen.getByRole('button', { name: 'Tạo báo giá' }));
    await waitFor(() => expect(quotationApi.createQuotation).toHaveBeenCalledWith(expect.objectContaining({
      showDiscount: false, showQuantity: false, showSubTotal: false, showGrandTotal: false,
      items: [expect.objectContaining({ quantity: 1, discountPercent: 0, groupSortOrder: 1 })],
    })));
  });
  it('allows each optional section to be enabled and retains a custom quantity and discount', async () => {
    await openEditor(); await addProduct();
    for (const label of ['Hiển thị CK (%)', 'Hiển thị Số lượng', 'Hiển thị Tạm tính hàng hóa', 'Hiển thị TỔNG CỘNG'])
      fireEvent.click(screen.getByRole('switch', { name: label, exact: true }));
    const quantity = screen.getByLabelText(`Số lượng ${product.name}`);
    fireEvent.change(quantity, { target: { value: '3' } }); fireEvent.blur(quantity);
    const discount = screen.getByLabelText(`Chiết khấu (%) ${product.name}`);
    fireEvent.change(discount, { target: { value: '10' } }); fireEvent.blur(discount);
    confirm(); fireEvent.click(screen.getByRole('button', { name: 'Tạo báo giá' }));
    await waitFor(() => expect(quotationApi.createQuotation).toHaveBeenCalledWith(expect.objectContaining({
      showDiscount: true, showQuantity: true, showSubTotal: true, showGrandTotal: true,
      items: [expect.objectContaining({ quantity: 3, discountPercent: 10 })],
    })));
  });
  it('sorts groups by configured order even when Xiên que was selected first', async () => {
    quotingProductApi.getProducts.mockResolvedValue([product, { ...product, id: 'xq-test', name: 'Xiên que', code: 'XQ-01', category: groups[1].name, groupId: groups[1].id, groupSortOrder: 2 }]);
    await openEditor(); next();
    fireEvent.click(screen.getByRole('button', { name: /^Thêm theo nhóm sản phẩm/ }));
    fireEvent.click(await screen.findByRole('option', { name: groups[1].name }));
    fireEvent.click(screen.getByRole('button', { name: /^Thêm theo nhóm sản phẩm/ }));
    fireEvent.click(await screen.findByRole('option', { name: groups[0].name }));
    confirm(); fireEvent.click(screen.getByRole('button', { name: 'Tạo báo giá' }));
    await waitFor(() => expect(quotationApi.createQuotation).toHaveBeenCalled());
    expect(quotationApi.createQuotation.mock.calls[0][0].items.map((item) => item.productCode)).toEqual(['CB-01', 'XQ-01']);
  });
  it('keeps the confirmation usable and offers retry when the draft preview fails', async () => {
    quotationApi.previewDraft.mockRejectedValueOnce(new Error('Không thể dựng mẫu'));
    await openEditor(); await addProduct(); confirm();
    expect(await screen.findByText('Không thể dựng mẫu')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại bản xem trước' }));
    expect(await screen.findByTitle('Bản xem trước trước khi tạo')).toBeInTheDocument();
    expect(quotationApi.createQuotation).not.toHaveBeenCalled();
  });

});
