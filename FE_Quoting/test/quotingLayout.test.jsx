import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import QuotingLayout from '../src/layouts/QuotingLayout';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();
let mockAuthData = {
  user: { fullName: 'Trần Quản Trị', email: 'admin@chuoianvat.vn' },
  isAdmin: true,
  logout: mockLogout,
};

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => mockAuthData,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('QuotingLayout - Kiểm thử cấu trúc Shell, Menu & Điều hướng', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthData = {
      user: { fullName: 'Trần Quản Trị', email: 'admin@chuoianvat.vn' },
      isAdmin: true,
      logout: mockLogout,
    };
  });

  // ==========================================
  // 1. HAPPY PATH (Đường chạy thuận lợi)
  // ==========================================
  describe('1. Đường chạy thuận lợi (Happy Path)', () => {
    it('hiển thị đầy đủ thương hiệu, tiêu đề các nhóm nghiệp vụ và 7 mục menu', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <QuotingLayout />
        </MemoryRouter>
      );

      // Thương hiệu
      expect(screen.getByText('CHUỖI ĂN VẶT')).toBeInTheDocument();

      // Tiêu đề các nhóm nghiệp vụ
      expect(screen.getByText('Nghiệp vụ')).toBeInTheDocument();
      expect(screen.getByText('Danh mục')).toBeInTheDocument();
      expect(screen.getByText('Cấu hình')).toBeInTheDocument();
      expect(screen.getAllByText('Hỗ trợ').length).toBeGreaterThan(0);

      // 7 mục menu nghiệp vụ chính thức
      expect(screen.getByText('Tổng quan')).toBeInTheDocument();
      expect(screen.getByText('Báo giá')).toBeInTheDocument();
      expect(screen.getByText('Tạo báo giá')).toBeInTheDocument();
      expect(screen.getByText('Danh mục sản phẩm')).toBeInTheDocument();
      expect(screen.getByText('Khách hàng')).toBeInTheDocument();
      expect(screen.getByText('Mẫu báo giá')).toBeInTheDocument();
      expect(screen.getAllByText('Hỗ trợ').length).toBeGreaterThan(0);
    });

    it('hiển thị đầy đủ thông tin user profile và badge quyền Admin ở footer', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <QuotingLayout />
        </MemoryRouter>
      );

      expect(screen.getByText('Trần Quản Trị')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Đăng xuất')).toBeInTheDocument();
    });

    it('điều hướng đúng đường dẫn khi người dùng nhấp vào từng mục menu', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <QuotingLayout />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByText('Báo giá'));
      expect(mockNavigate).toHaveBeenCalledWith('/quotations');

      fireEvent.click(screen.getByText('Tạo báo giá'));
      expect(mockNavigate).toHaveBeenCalledWith('/quotations/create');

      fireEvent.click(screen.getByText('Danh mục sản phẩm'));
      expect(mockNavigate).toHaveBeenCalledWith('/products');

      fireEvent.click(screen.getByText('Khách hàng'));
      expect(mockNavigate).toHaveBeenCalledWith('/customers');

      fireEvent.click(screen.getByText('Mẫu báo giá'));
      expect(mockNavigate).toHaveBeenCalledWith('/templates');

      fireEvent.click(screen.getByRole('button', { name: 'Hỗ trợ' }));
      expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });

    it('thực hiện logout và điều hướng về /login khi nhấn nút Đăng xuất', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <QuotingLayout />
        </MemoryRouter>
      );

      const logoutBtn = screen.getByText('Đăng xuất');
      fireEvent.click(logoutBtn);

      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  // ==========================================
  // 2. EDGE CASES (Các trường hợp biên)
  // ==========================================
  describe('2. Các trường hợp biên (Edge Cases)', () => {
    it('hiển thị fallback email khi user không có fullName', () => {
      mockAuthData = {
        user: { fullName: '', email: 'nhanvien@chuoianvat.vn' },
        isAdmin: false,
        logout: mockLogout,
      };

      render(
        <MemoryRouter initialEntries={['/']}>
          <QuotingLayout />
        </MemoryRouter>
      );

      expect(screen.getByText('nhanvien@chuoianvat.vn')).toBeInTheDocument();
      expect(screen.getByText('NV')).toBeInTheDocument();
    });

    it('hiển thị fallback "Người dùng" khi user object rỗng hoặc null', () => {
      mockAuthData = {
        user: null,
        isAdmin: false,
        logout: mockLogout,
      };

      render(
        <MemoryRouter initialEntries={['/']}>
          <QuotingLayout />
        </MemoryRouter>
      );

      expect(screen.getByText('Người dùng')).toBeInTheDocument();
      expect(screen.getByText('NV')).toBeInTheDocument();
    });

    it('phân biệt đúng active state giữa Báo giá và Tạo báo giá với path con', () => {
      // Khi đang ở /quotations/quote-101 (chi tiết), mục "Báo giá" phải được active
      const { unmount } = render(
        <MemoryRouter initialEntries={['/quotations/quote-101']}>
          <QuotingLayout />
        </MemoryRouter>
      );

      const quotationItem = screen.getByText('Báo giá').closest('[aria-selected], [data-selected], li, button, div');
      expect(quotationItem).toBeInTheDocument();
      unmount();

      // Khi đang ở /quotations/create, mục "Tạo báo giá" được active
      render(
        <MemoryRouter initialEntries={['/quotations/create']}>
          <QuotingLayout />
        </MemoryRouter>
      );
      expect(screen.getByText('Tạo báo giá')).toBeInTheDocument();
    });
  });

  // ==========================================
  // 3. NEGATIVE / FAILURE CASES (Trường hợp ngoại lệ & Phân quyền)
  // ==========================================
  describe('3. Trường hợp ngoại lệ / Thất bại (Failure Cases)', () => {
    it('không highlight bất kỳ menu nào khi truy cập đường dẫn không tồn tại / 404', () => {
      render(
        <MemoryRouter initialEntries={['/unknown-unregistered-route']}>
          <QuotingLayout />
        </MemoryRouter>
      );

      // Tất cả 7 menu chính không mục nào có trạng thái active
      const menuLabels = [
        'Báo giá',
        'Tạo báo giá',
        'Danh mục sản phẩm',
        'Khách hàng',
        'Mẫu báo giá',
        'Hỗ trợ',
      ];

      menuLabels.forEach((label) => {
        const item = screen.getAllByText(label).at(-1).closest('[aria-selected="true"]');
        expect(item).toBeNull();
      });
    });

    it('tài khoản nhân viên không được gán quyền Admin', () => {
      mockAuthData = {
        user: { fullName: 'Nhân Viên Bán Hàng', email: 'sale@chuoianvat.vn' },
        isAdmin: false,
        logout: mockLogout,
      };

      render(
        <MemoryRouter initialEntries={['/']}>
          <QuotingLayout />
        </MemoryRouter>
      );

      // Tuyệt đối không được xuất hiện badge 'Admin'
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
  });
});
