import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProductCatalogPage from '../src/pages/products/ProductCatalogPage';
import { product } from './fixtures';
vi.mock('../src/contexts/AuthContext', () => ({ useAuth: () => ({ isAdmin: true }) }));
vi.mock('@astryxdesign/core/hooks', async () => ({ ...await vi.importActual('@astryxdesign/core/hooks'), useMediaQuery: () => true }));
vi.mock('../src/api/quotingProductGroupApi', () => ({ quotingProductGroupApi: { getGroups: vi.fn(async () => (await import('./fixtures')).groups) } }));
vi.mock('../src/api/quotingProductApi', () => ({ quotingProductApi: { getProducts: vi.fn(async () => [product]) } }));
describe('Mobile product information', () => {
  it('exposes all business fields and edit action without hidden table columns', async () => {
    render(<MemoryRouter><ProductCatalogPage /></MemoryRouter>);
    const list = await screen.findByLabelText('Danh sách sản phẩm trên điện thoại');
    for (const text of [product.code, product.name, product.description, 'Đang bán']) expect(within(list).getByText(text)).toBeInTheDocument();
    expect(list).toHaveTextContent(`Đơn vị tính: ${product.unit}`);
    expect(within(list).getByText(/Giá danh mục:/)).toHaveTextContent('18.000'); expect(list).toHaveTextContent(`Nhóm sản phẩm: ${product.category}`);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(within(list).getAllByRole('button')).toHaveLength(2); fireEvent.click(within(list).getByRole('button', { name: 'Sửa sản phẩm', exact: true })); expect(await screen.findByRole('dialog', { name: 'Sửa sản phẩm' })).toBeInTheDocument();
  });
});
