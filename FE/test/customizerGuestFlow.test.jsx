import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CustomizerPage from '../src/pages/CustomizerPage';
import AppRoutes from '../src/routes';
import { templateApi } from '../src/api/templateApi';
import { customizationApi } from '../src/api/customizationApi';
import useAuth from '../src/hooks/useAuth';
import * as htmlExporter from '../src/utils/htmlExporter';

// Mock APIs
vi.mock('../src/api/templateApi', () => ({
  templateApi: {
    getTemplateById: vi.fn(),
  },
}));

vi.mock('../src/api/customizationApi', () => ({
  customizationApi: {
    saveCustomization: vi.fn(),
    updateCustomization: vi.fn(),
    getCustomizationById: vi.fn(),
  },
}));

// Mock useAuth
vi.mock('../src/hooks/useAuth', () => ({
  default: vi.fn(),
}));

describe('Guest Customization Flow (Happy Paths & Error Handling)', () => {
  const mockTemplate = {
    id: 'tpl-wedding-01',
    name: 'Đám Cưới Hoàng Gia',
    slug: 'dam-cuoi-hoang-gia',
    category: 'Wedding',
    defaultConfigJson: JSON.stringify({
      theme: { primaryColor: '#e11d48', defaultAnimation: 'fade-up' },
      hero: { title: 'Tuấn & Hương', badge: 'SAVE THE DATE' },
      coupleOrCelebrant: {
        type: 'wedding',
        person1: { name: 'Tuấn', title: 'Chú Rể' },
        person2: { name: 'Hương', title: 'Cô Dâu' },
      },
    }),
  };

  const renderCustomizer = (initialRoute = '/customize/tpl-wedding-01') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/customize/:templateId" element={<CustomizerPage />} />
          <Route path="/customize/:templateId/:customizationId" element={<CustomizerPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default: guest user (not logged in)
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    templateApi.getTemplateById.mockResolvedValue(mockTemplate);
    window.alert = vi.fn();
  });

  it('allows guest to access /customize/:templateId without redirection to login', async () => {
    render(
      <MemoryRouter initialEntries={['/customize/tpl-wedding-01']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Wait for customizer to load template
    await waitFor(() => {
      expect(screen.getByText('Đám Cưới Hoàng Gia - Thiệp Mời')).toBeInTheDocument();
    });

    // Verify it stayed on CustomizerPage and did NOT redirect to login
    expect(screen.queryByText(/đăng nhập vào tài khoản/i)).not.toBeInTheDocument();
  });

  it('allows guest to create new customization (UserId == null) and redirects to new customization URL', async () => {
    const newCustomizationId = 'cust-new-999';
    customizationApi.saveCustomization.mockResolvedValueOnce(newCustomizationId);

    renderCustomizer('/customize/tpl-wedding-01');

    await waitFor(() => {
      expect(screen.getByText('Đám Cưới Hoàng Gia - Thiệp Mời')).toBeInTheDocument();
    });

    // Click "Lưu" button in toolbar
    const saveBtn = screen.getByRole('button', { name: /^lưu$/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(customizationApi.saveCustomization).toHaveBeenCalledTimes(1);
      const callArg = customizationApi.saveCustomization.mock.calls[0][0];
      expect(callArg.templateId).toBe('tpl-wedding-01');
      expect(callArg.title).toBe('Đám Cưới Hoàng Gia - Thiệp Mời');
      expect(callArg.isPublished).toBe(true);
      expect(callArg.configJson).toContain('Tuấn & Hương');
    });

    // Check localStorage guest backup was written
    const savedDraftStr = localStorage.getItem('guest_draft_tpl-wedding-01');
    expect(savedDraftStr).toBeDefined();
    const savedDraft = JSON.parse(savedDraftStr);
    expect(savedDraft.config).toBeDefined();

    expect(window.alert).toHaveBeenCalledWith('Lưu thiệp mới thành công!');
  });

  it('allows guest to update existing customization via PUT without login', async () => {
    const existingCustomizationId = 'cust-guest-888';
    const mockCustomization = {
      id: existingCustomizationId,
      templateId: 'tpl-wedding-01',
      title: 'Thiệp Cưới Của Tuấn & Hương',
      slug: 'tuan-huong-wedding',
      isPublished: true,
      configJson: JSON.stringify({
        theme: { primaryColor: '#e11d48' },
        hero: { title: 'Tuấn & Hương 2026' },
        coupleOrCelebrant: {
          person1: { name: 'Tuấn', title: 'Chú Rể' },
        },
      }),
    };

    customizationApi.getCustomizationById.mockResolvedValueOnce(mockCustomization);
    customizationApi.updateCustomization.mockResolvedValueOnce({ success: true });

    renderCustomizer(`/customize/tpl-wedding-01/${existingCustomizationId}`);

    await waitFor(() => {
      expect(screen.getByText('Thiệp Cưới Của Tuấn & Hương')).toBeInTheDocument();
    });

    // Click "Lưu" button
    const saveBtn = screen.getByRole('button', { name: /^lưu$/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(customizationApi.updateCustomization).toHaveBeenCalledTimes(1);
      expect(customizationApi.updateCustomization).toHaveBeenCalledWith(
        existingCustomizationId,
        expect.objectContaining({
          templateId: 'tpl-wedding-01',
          title: 'Thiệp Cưới Của Tuấn & Hương',
          slug: 'tuan-huong-wedding',
          isPublished: true,
        })
      );
    });

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining('Cập nhật thiệp thành công')
    );
  });

  it('safely handles API save failure by notifying user of local browser backup', async () => {
    customizationApi.saveCustomization.mockRejectedValueOnce(new Error('Network disconnected'));

    renderCustomizer('/customize/tpl-wedding-01');

    await waitFor(() => {
      expect(screen.getByText('Đám Cưới Hoàng Gia - Thiệp Mời')).toBeInTheDocument();
    });

    const saveBtn = screen.getByRole('button', { name: /^lưu$/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Network disconnected');
    });

    // Ensure local backup was saved even though network call failed
    const draft = localStorage.getItem('guest_draft_tpl-wedding-01');
    expect(draft).not.toBeNull();
  });

  it('restores draft from localStorage when reopening customizer for that template', async () => {
    const draftData = {
      metadata: {
        title: 'Bản Nháp Khôi Phục',
        slug: 'ban-nhap-khoi-phuc',
        isPublished: true,
      },
      config: {
        theme: { primaryColor: '#2563eb' },
        hero: { title: 'Tiệc Khôi Phục' },
        coupleOrCelebrant: {
          person1: { name: 'Người Khôi Phục', title: 'Chủ Tiệc' },
        },
      },
    };
    localStorage.setItem('guest_draft_tpl-wedding-01', JSON.stringify(draftData));

    renderCustomizer('/customize/tpl-wedding-01');

    await waitFor(() => {
      expect(screen.getByText('Tiệc Khôi Phục')).toBeInTheDocument();
      expect(screen.getByText('Người Khôi Phục')).toBeInTheDocument();
    });
  });

  it('triggers standalone HTML export when "Xuất HTML" button is clicked', async () => {
    const exportSpy = vi.spyOn(htmlExporter, 'exportStandaloneHtml').mockImplementation(() => {});

    renderCustomizer('/customize/tpl-wedding-01');

    await waitFor(() => {
      expect(screen.getByText('Đám Cưới Hoàng Gia - Thiệp Mời')).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /html/i });
    fireEvent.click(exportBtn);

    expect(exportSpy).toHaveBeenCalledTimes(1);
    expect(exportSpy).toHaveBeenCalledWith(
      expect.any(Object),
      'Đám Cưới Hoàng Gia - Thiệp Mời'
    );
  });
});
