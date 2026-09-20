import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../src/pages/HomePage';
import { templateApi } from '../src/api/templateApi';

// Mock templateApi
vi.mock('../src/api/templateApi', () => ({
  templateApi: {
    getTemplates: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HomePage Component (Full-Screen Sections & Showcase)', () => {
  const mockApiTemplates = [
    {
      id: 'tmpl-api-01',
      name: 'Hôn Lễ Pha Lê Tinh Khiết',
      slug: 'hon-le-pha-le',
      category: 'Wedding',
      badge: 'HOT',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674?w=800',
      longPreviewUrl: 'https://images.unsplash.com/photo-151974149767?w=1600',
      musicTitle: 'Perfect Symphony',
    },
    {
      id: 'tmpl-api-02',
      name: 'Sinh Nhật Tuổi Thần Tiên',
      slug: 'sinh-nhat-than-tien',
      category: 'Birthday',
      badge: 'NEW',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513151233558?w=800',
      longPreviewUrl: 'https://images.unsplash.com/photo-1513151233?w=1600',
      musicTitle: 'Celebration Time',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    // Default: suppress splash screen for fast UI assertions
    sessionStorage.setItem('splash_shown', 'true');
  });

  describe('Happy Paths (Đường chạy thuận lợi)', () => {
    it('renders all 3 fullscreen sections with rich content', async () => {
      templateApi.getTemplates.mockResolvedValueOnce(mockApiTemplates);

      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      // Section 1: Hero Section
      expect(screen.getByText(/thế hệ thiệp điện tử chuyển động mới/i)).toBeInTheDocument();
      expect(screen.getByText(/tạo landing page/i)).toBeInTheDocument();
      expect(screen.getByText(/đám cưới & sinh nhật/i)).toBeInTheDocument();
      expect(screen.getByText(/100%/i)).toBeInTheDocument();
      expect(screen.getByText(/0đ/i)).toBeInTheDocument();
      expect(screen.getByText(/1 click/i)).toBeInTheDocument();
      expect(screen.getByText(/quản lý khách mời/i)).toBeInTheDocument();

      // Section 2: Masked Cards Showcase with real templates
      await waitFor(() => {
        expect(screen.getByText('Hôn Lễ Pha Lê Tinh Khiết')).toBeInTheDocument();
        expect(screen.getByText('Sinh Nhật Tuổi Thần Tiên')).toBeInTheDocument();
      });
      expect(screen.getByText('Perfect Symphony')).toBeInTheDocument();
      expect(screen.getByText('Celebration Time')).toBeInTheDocument();

      // Section 3: Bento Experience Workflow (3 Steps)
      expect(screen.getByText(/3 bước sở hữu trang thiệp mơ ước/i)).toBeInTheDocument();
      expect(screen.getByText(/chọn mẫu thiết kế/i)).toBeInTheDocument();
      expect(screen.getAllByText(/tùy biến trực quan/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/chia sẻ & thu rsvp/i)).toBeInTheDocument();

      // High-Impact CTA Banner
      expect(
        screen.getByText(/sẵn sàng tạo ấn tượng khó quên cho ngày vui của bạn\?/i)
      ).toBeInTheDocument();
    });

    it('navigates to /customize/:id when clicking "Tùy Biến Ngay"', async () => {
      templateApi.getTemplates.mockResolvedValueOnce(mockApiTemplates);

      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Hôn Lễ Pha Lê Tinh Khiết')).toBeInTheDocument();
      });

      const customizeButtons = screen.getAllByRole('button', { name: /tùy biến ngay/i });
      expect(customizeButtons.length).toBeGreaterThan(0);

      fireEvent.click(customizeButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/customize/tmpl-api-01');
    });

    it('opens QuickPreviewModal when clicking "Xem Chi Tiết" or "Xem Thử Nhanh"', async () => {
      templateApi.getTemplates.mockResolvedValueOnce(mockApiTemplates);

      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Hôn Lễ Pha Lê Tinh Khiết')).toBeInTheDocument();
      });

      const detailButtons = screen.getAllByRole('button', { name: /xem chi tiết/i });
      fireEvent.click(detailButtons[0]);

      // QuickPreviewModal should now open displaying template name in modal header
      await waitFor(() => {
        expect(screen.getAllByText('Hôn Lễ Pha Lê Tinh Khiết').length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Edge Cases (Trường hợp biên & An toàn giao diện)', () => {
    it('safely falls back to default templates when templateApi returns empty array []', async () => {
      templateApi.getTemplates.mockResolvedValueOnce([]);

      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      // Should display fallback templates without blank screen or crash
      await waitFor(() => {
        expect(screen.getByText('Hôn Lễ Hoàng Gia (Royal Wedding)')).toBeInTheDocument();
      });
      expect(screen.getByText('Sinh Nhật Ngọt Ngào (Sweet Birthday)')).toBeInTheDocument();
    });

    it('safely falls back to default templates when templateApi throws network error', async () => {
      templateApi.getTemplates.mockRejectedValueOnce(new Error('Network error 500'));

      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Hôn Lễ Hoàng Gia (Royal Wedding)')).toBeInTheDocument();
      });
      expect(screen.getByText('Đám Cưới Tối Giản (Modern Minimalist)')).toBeInTheDocument();
    });

    it('shows SplashScreen when session does not have splash_shown flag', () => {
      sessionStorage.clear(); // no splash_shown flag

      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      expect(screen.getByRole('status', { name: /loading splash screen/i })).toBeInTheDocument();
    });
  });
});
