import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuotationListPage from '../src/pages/quotations/QuotationListPage';
import ProductCatalogPage from '../src/pages/products/ProductCatalogPage';
import CustomerListPage from '../src/pages/customers/CustomerListPage';
import { quotationApi } from '../src/api/quotationApi';
import { quotingProductApi } from '../src/api/quotingProductApi';
import { quotingCustomerApi } from '../src/api/quotingCustomerApi';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAdmin: true,
    user: { fullName: 'Admin Tester' },
  }),
}));

vi.mock('../src/api/quotationApi', () => ({
  quotationApi: {
    getSummary: vi.fn().mockResolvedValue({ totalCount: 3, draftCount: 1, sentCount: 1, approvedCount: 1 }),
    getQuotations: vi.fn(),
  },
}));

vi.mock('../src/api/quotingProductApi', () => ({
  quotingProductApi: {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

vi.mock('../src/api/quotingCustomerApi', () => ({
  quotingCustomerApi: {
    getCustomers: vi.fn(),
    createCustomer: vi.fn(),
    updateCustomer: vi.fn(),
    deleteCustomer: vi.fn(),
  },
}));

describe('Table & Filter Pages - Kiểm thử Danh Sách & Bộ Lọc', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // PHẦN 1: QUOTATION LIST PAGE
  // ==========================================
  describe('QuotationListPage (Báo giá)', () => {
    const mockQuotations = [
      {
        id: 'q-101',
        quotationNumber: 'BG-2026-101',
        customerName: 'Đại Lý Trà Sữa Phúc Long An',
        customerPhone: '0912345678',
        issueDate: '2026-11-01',
        totalAmount: 18000000,
        status: 'Approved',
        templateVersion: 1,
      },
      {
        id: 'q-102',
        quotationNumber: 'BG-2026-102',
        customerName: 'Căn Tin Trường THPT Nguyễn Du',
        customerPhone: '0987654321',
        issueDate: '2026-11-04',
        totalAmount: 7500000,
        status: 'Sent',
        templateVersion: 2,
      },
      {
        id: 'q-103',
        quotationNumber: 'BG-2026-103',
        customerName: 'Chuỗi Xe Đẩy Xiên Que Vỉa Hè',
        customerPhone: '0933445566',
        issueDate: '2026-11-06',
        totalAmount: 5000000,
        status: 'Draft',
        templateVersion: 1,
      },
    ];

    it('Happy path: Hiển thị đầy đủ danh sách báo giá và KPI summary card', async () => {
      quotationApi.getQuotations.mockResolvedValueOnce({
        data: mockQuotations, total: mockQuotations.length,
      });

      render(
        <MemoryRouter>
          <QuotationListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(quotationApi.getQuotations).toHaveBeenCalled();
      });

      expect(screen.getByText('Báo giá')).toBeInTheDocument();
      expect(screen.getByText('BG-2026-101')).toBeInTheDocument();
      expect(screen.getByText('Đại Lý Trà Sữa Phúc Long An')).toBeInTheDocument();
      expect(screen.getByText('BG-2026-102')).toBeInTheDocument();
      expect(screen.getByText('Căn Tin Trường THPT Nguyễn Du')).toBeInTheDocument();
    });

    it('Happy path: Tìm kiếm báo giá theo số báo giá hoặc tên khách hàng', async () => {
      quotationApi.getQuotations.mockResolvedValueOnce({
        data: mockQuotations, total: mockQuotations.length,
      });

      render(
        <MemoryRouter>
          <QuotationListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('BG-2026-101')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Tìm theo số báo giá, tên khách...');
      quotationApi.getQuotations.mockResolvedValueOnce({ data: [mockQuotations[0]], total: 1 });
      fireEvent.change(searchInput, { target: { value: 'Phúc Long An' } });
      await screen.findByText('Đại Lý Trà Sữa Phúc Long An');

      // Chỉ hiển thị báo giá của Phúc Long An
      expect(screen.getByText('Đại Lý Trà Sữa Phúc Long An')).toBeInTheDocument();
      expect(screen.queryByText('Căn Tin Trường THPT Nguyễn Du')).not.toBeInTheDocument();
      expect(screen.queryByText('Chuỗi Xe Đẩy Xiên Que Vỉa Hè')).not.toBeInTheDocument();
    });

    it('Edge case: Tìm kiếm từ khóa không tồn tại -> hiển thị EmptyState', async () => {
      quotationApi.getQuotations.mockResolvedValueOnce({
        data: mockQuotations, total: mockQuotations.length,
      });

      render(
        <MemoryRouter>
          <QuotationListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('BG-2026-101')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Tìm theo số báo giá, tên khách...');
      quotationApi.getQuotations.mockResolvedValueOnce({ data: [], total: 0 });
      fireEvent.change(searchInput, { target: { value: 'Từ Khóa Không Khớp Bất Kỳ Ai' } });
      await screen.findByText('Chưa có báo giá nào');

      expect(screen.getByText('Chưa có báo giá nào')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Tạo báo giá/i }).length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // PHẦN 2: PRODUCT CATALOG PAGE
  // ==========================================
  describe('ProductCatalogPage (Danh mục sản phẩm)', () => {
    const mockProducts = [
      {
        id: 'p-1',
        code: 'CB-01',
        name: 'COMBO NGUYÊN BẢN BAO NGON',
        description: 'Set đồ ăn vặt chuẩn vị',
        unit: 'Gói',
        price: 35000,
        category: 'A/ DÒNG COMBO',
        imageUrl: '',
        isActive: true,
      },
      {
        id: 'p-2',
        code: 'XQ-01',
        name: 'XIÊN CÁ VIÊN CHIÊN ĐẬM VỊ',
        description: 'Cá viên basa cao cấp',
        unit: '10 Que/Gói',
        price: 22000,
        category: 'B/ DÒNG XIÊN QUE',
        imageUrl: '',
        isActive: true,
      },
    ];

    it('Happy path: Hiển thị danh sách sản phẩm và lọc theo phân nhóm dòng sản phẩm', async () => {
      quotingProductApi.getProducts.mockResolvedValueOnce(mockProducts);

      render(
        <MemoryRouter>
          <ProductCatalogPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(quotingProductApi.getProducts).toHaveBeenCalled();
      });

      expect(screen.getByText('Danh mục sản phẩm')).toBeInTheDocument();
      expect(screen.getByText('CB-01')).toBeInTheDocument();
      expect(screen.getByText('COMBO NGUYÊN BẢN BAO NGON')).toBeInTheDocument();
      expect(screen.getByText('XQ-01')).toBeInTheDocument();
      expect(screen.getByText('XIÊN CÁ VIÊN CHIÊN ĐẬM VỊ')).toBeInTheDocument();
    });

    it('Happy path: Mở form thêm sản phẩm mới và gọi createProduct thành công', async () => {
      quotingProductApi.getProducts.mockResolvedValueOnce(mockProducts);
      quotingProductApi.createProduct.mockResolvedValueOnce({ id: 'p-new', code: 'SP-9999' });

      render(
        <MemoryRouter>
          <ProductCatalogPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Danh mục sản phẩm')).toBeInTheDocument();
      });

      // Bấm nút thêm mới
      fireEvent.click(screen.getByRole('button', { name: /Thêm sản phẩm/i }));
      expect(screen.getByText('Thêm sản phẩm', { selector: 'h2' })).toBeInTheDocument();

      // Điền thông tin
      const nameInput = screen.getByPlaceholderText('VD: COMBO NGUYÊN BẢN BAO NGON');
      fireEvent.change(nameInput, { target: { value: 'Sản Phẩm Test Mới' } });

      // Lưu
      const saveBtn = screen.getByRole('button', { name: /Lưu sản phẩm/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(quotingProductApi.createProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Sản Phẩm Test Mới',
          })
        );
      });
    });

    it('Negative case: Form từ chối lưu khi để trống Mã sản phẩm hoặc Tên sản phẩm', async () => {
      quotingProductApi.getProducts.mockResolvedValueOnce(mockProducts);

      render(
        <MemoryRouter>
          <ProductCatalogPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Danh mục sản phẩm')).toBeInTheDocument();
      });

      // Mở form
      fireEvent.click(screen.getByRole('button', { name: /Thêm sản phẩm/i }));

      // Xóa mã sản phẩm mặc định
      const codeInput = screen.getByLabelText(/Mã sản phẩm/i);
      fireEvent.change(codeInput, { target: { value: '' } });

      // Bấm lưu
      const saveBtn = screen.getByRole('button', { name: /Lưu sản phẩm/i });
      fireEvent.click(saveBtn);

      expect(quotingProductApi.createProduct).not.toHaveBeenCalled();
      expect(screen.getByText('Mã và Tên sản phẩm không được để trống.')).toBeInTheDocument();
    });
  });

  // ==========================================
  // PHẦN 3: CUSTOMER LIST PAGE
  // ==========================================
  describe('CustomerListPage (Khách hàng)', () => {
    const mockCustomers = [
      {
        id: 'c-1',
        name: 'CÔNG TY TNHH THỰC PHẨM BA MIỀN',
        contactPerson: 'Chị Mai',
        phone: '0909112233',
        email: 'mai.food@bamien.vn',
        address: 'Số 45 Lê Duẩn, Quận 1',
        taxCode: '0315678901',
      },
      {
        id: 'c-2',
        name: 'ĐẠI LÝ ĂN VẶT HOÀNG GIA',
        contactPerson: 'Anh Hoàng',
        phone: '0933221100',
        email: 'hoang@anvathoanggia.com',
        address: 'Bình Tân, TP.HCM',
        taxCode: '0319876543',
      },
    ];

    it('Happy path: Hiển thị danh sách khách hàng và tìm kiếm theo tên hoặc SĐT', async () => {
      quotingCustomerApi.getCustomers.mockResolvedValueOnce(mockCustomers);

      render(
        <MemoryRouter>
          <CustomerListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(quotingCustomerApi.getCustomers).toHaveBeenCalled();
      });

      expect(screen.getByText('Khách hàng')).toBeInTheDocument();
      expect(screen.getByText('CÔNG TY TNHH THỰC PHẨM BA MIỀN')).toBeInTheDocument();
      expect(screen.getByText('ĐẠI LÝ ĂN VẶT HOÀNG GIA')).toBeInTheDocument();

      // Tìm kiếm theo số điện thoại
      const searchInput = screen.getByPlaceholderText('Tìm theo tên, SĐT, MST...');
      fireEvent.change(searchInput, { target: { value: '0909112233' } });

      expect(screen.getByText('CÔNG TY TNHH THỰC PHẨM BA MIỀN')).toBeInTheDocument();
      expect(screen.queryByText('ĐẠI LÝ ĂN VẶT HOÀNG GIA')).not.toBeInTheDocument();
    });

    it('Happy path: Mở form thêm mới và gọi createCustomer thành công', async () => {
      quotingCustomerApi.getCustomers.mockResolvedValueOnce(mockCustomers);
      quotingCustomerApi.createCustomer.mockResolvedValueOnce({ id: 'c-new' });

      render(
        <MemoryRouter>
          <CustomerListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Khách hàng')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Thêm khách hàng/i }));
      expect(screen.getByText('Thêm khách hàng', { selector: 'h2' })).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText('VD: CÔNG TY TNHH ABC'), {
        target: { value: 'Công Ty Mới Khởi Tạo' },
      });
      fireEvent.change(screen.getByPlaceholderText('0901234567'), {
        target: { value: '0919998877' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Lưu khách hàng/i }));

      await waitFor(() => {
        expect(quotingCustomerApi.createCustomer).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Công Ty Mới Khởi Tạo',
            phone: '0919998877',
          })
        );
      });
    });

    it('Negative case: Form từ chối lưu khi để trống Tên khách hàng hoặc Số điện thoại', async () => {
      quotingCustomerApi.getCustomers.mockResolvedValueOnce(mockCustomers);

      render(
        <MemoryRouter>
          <CustomerListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Khách hàng')).toBeInTheDocument();
      });

      // Mở form
      fireEvent.click(screen.getByRole('button', { name: /Thêm khách hàng/i }));

      // Không điền gì mà bấm lưu
      fireEvent.click(screen.getByRole('button', { name: /Lưu khách hàng/i }));

      expect(quotingCustomerApi.createCustomer).not.toHaveBeenCalled();
      expect(screen.getByText('Tên khách hàng và Số điện thoại là bắt buộc.')).toBeInTheDocument();
    });
  });
});
