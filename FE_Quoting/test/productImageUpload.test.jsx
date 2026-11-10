import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProductCatalogPage from '../src/pages/products/ProductCatalogPage';
import { quotingProductApi } from '../src/api/quotingProductApi';
vi.mock('../src/contexts/AuthContext', () => ({ useAuth: () => ({ isAdmin: true }) }));
vi.mock('../src/api/quotingProductGroupApi', () => ({ quotingProductGroupApi: { getGroups: vi.fn(async () => (await import('./fixtures')).groups) } }));
vi.mock('../src/api/quotingProductApi', () => ({ quotingProductApi: { getProducts: vi.fn(), createProduct: vi.fn(), uploadImage: vi.fn() } }));
const imageUrl = '/api/v1/quoting/product-images/uploads/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png';
const originalCreate = URL.createObjectURL; const originalRevoke = URL.revokeObjectURL;
beforeEach(() => { vi.clearAllMocks(); URL.createObjectURL = vi.fn(() => 'blob:photo-preview'); URL.revokeObjectURL = vi.fn(); quotingProductApi.getProducts.mockResolvedValue([]); quotingProductApi.createProduct.mockResolvedValue('product-id'); quotingProductApi.uploadImage.mockResolvedValue({ image: { imageUrl } }); });
afterAll(() => { URL.createObjectURL = originalCreate; URL.revokeObjectURL = originalRevoke; });
async function form() {
  render(<MemoryRouter><ProductCatalogPage /></MemoryRouter>);
  await screen.findByText('Không tìm thấy sản phẩm'); fireEvent.click(screen.getByRole('button', { name: 'Thêm sản phẩm', exact: true }));
  const drawer = await screen.findByRole('dialog', { name: 'Thêm sản phẩm' }); fireEvent.change(within(drawer).getByLabelText('Tên sản phẩm'), { target: { value: 'Sản phẩm tải ảnh' } }); return drawer;
}
function choose(drawer) { const file = new File(['image bytes'], 'anh-san-pham.png', { type: 'image/png' }); fireEvent.change(within(drawer).getByLabelText('Ảnh sản phẩm', { selector: 'input' }), { target: { files: [file] } }); return file; }
describe('Product photo upload without entering a URL', () => {
  it('previews a selected photo, uploads on save and persists the returned URL', async () => {
    const drawer = await form(); const file = choose(drawer);
    expect(within(drawer).getByAltText('Ảnh sản phẩm đang chọn')).toHaveAttribute('src', 'blob:photo-preview');
    expect(quotingProductApi.uploadImage).not.toHaveBeenCalled();
    fireEvent.click(within(drawer).getByRole('button', { name: 'Lưu sản phẩm' }));
    await waitFor(() => expect(quotingProductApi.createProduct).toHaveBeenCalledWith(expect.objectContaining({ imageUrl })));
    expect(quotingProductApi.uploadImage).toHaveBeenCalledExactlyOnceWith(file);
    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo-preview'));
  });
  it('does not create a product or discard the selected file when upload fails', async () => {
    quotingProductApi.uploadImage.mockRejectedValueOnce(new Error('Chưa thể tải ảnh'));
    const drawer = await form(); choose(drawer); fireEvent.click(within(drawer).getByRole('button', { name: 'Lưu sản phẩm' }));
    expect(await within(drawer).findByText('Chưa thể tải ảnh')).toBeInTheDocument(); expect(quotingProductApi.createProduct).not.toHaveBeenCalled();
    expect(within(drawer).getByAltText('Ảnh sản phẩm đang chọn')).toHaveAttribute('src', 'blob:photo-preview');
  });
  it('retries saving without uploading twice after product persistence fails', async () => {
    quotingProductApi.createProduct.mockRejectedValueOnce(new Error('Mã sản phẩm bị trùng'));
    const drawer = await form(); choose(drawer); fireEvent.click(within(drawer).getByRole('button', { name: 'Lưu sản phẩm' }));
    await within(drawer).findByText('Mã sản phẩm bị trùng'); fireEvent.click(within(drawer).getByRole('button', { name: 'Lưu sản phẩm' }));
    await waitFor(() => expect(quotingProductApi.createProduct).toHaveBeenCalledTimes(2)); expect(quotingProductApi.uploadImage).toHaveBeenCalledOnce();
  });
  it('cancels without upload and releases the local preview', async () => {
    const drawer = await form(); choose(drawer); fireEvent.click(within(drawer).getByRole('button', { name: 'Hủy', exact: true }));
    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo-preview')); expect(quotingProductApi.uploadImage).not.toHaveBeenCalled(); expect(quotingProductApi.createProduct).not.toHaveBeenCalled();
  });
  it('removes a chosen photo before saving without uploading', async () => {
    const drawer = await form(); choose(drawer); fireEvent.click(within(drawer).getByRole('button', { name: 'Xóa ảnh', exact: true }));
    fireEvent.click(within(drawer).getByRole('button', { name: 'Lưu sản phẩm' }));
    await waitFor(() => expect(quotingProductApi.createProduct).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: '' }))); expect(quotingProductApi.uploadImage).not.toHaveBeenCalled();
  });
});
