import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { COLOR_PALETTES, applyPaletteToConfig } from '../src/utils/colorPalettes';
import HierarchicalCardsSection from '../src/components/templates/sections/HierarchicalCardsSection';
import DeviceSimulator, { DEVICE_CATALOG } from '../src/components/common/DeviceSimulator';
import {
  ANIMATION_GROUPS,
  ANIMATION_OPTIONS,
  PARTICLES_OPTIONS,
  getAnimationClass,
} from '../src/utils/animationConstants';
import { templateApi } from '../src/api/templateApi';
import api from '../src/api/axios';
import vercelConfig from '../vercel.json';

// Mock axios instance
vi.mock('../src/api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Chặng 3 Frontend Tests: Advanced Editor & Community Templates', () => {
  describe('1. Happy Paths (Đường chạy thuận lợi)', () => {
    it('provides exactly 10 distinct professional color palettes with valid hex colors', () => {
      expect(COLOR_PALETTES).toHaveLength(10);

      const hexRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
      COLOR_PALETTES.forEach((palette) => {
        expect(palette.id).toBeDefined();
        expect(palette.name).toBeDefined();
        expect(palette.primaryColor).toMatch(hexRegex);
        expect(palette.secondaryColor).toMatch(hexRegex);
        expect(palette.accentColor).toMatch(hexRegex);
        expect(palette.backgroundColor).toMatch(hexRegex);
        expect(palette.textColor).toMatch(hexRegex);
      });
    });

    it('applyPaletteToConfig updates theme colors accurately with 1-click', () => {
      const initialConfig = {
        theme: {
          primaryColor: '#000000',
          secondaryColor: '#111111',
          accentColor: '#222222',
          backgroundColor: '#333333',
          textColor: '#444444',
          fontFamily: 'Playfair Display',
        },
      };

      const luxuryGold = COLOR_PALETTES.find((p) => p.id === 'luxury-gold');
      const updatedConfig = applyPaletteToConfig(initialConfig, luxuryGold);

      expect(updatedConfig.theme.primaryColor).toBe(luxuryGold.primaryColor);
      expect(updatedConfig.theme.secondaryColor).toBe(luxuryGold.secondaryColor);
      expect(updatedConfig.theme.accentColor).toBe(luxuryGold.accentColor);
      expect(updatedConfig.theme.backgroundColor).toBe(luxuryGold.backgroundColor);
      expect(updatedConfig.theme.textColor).toBe(luxuryGold.textColor);
      // Preserves untouched properties
      expect(updatedConfig.theme.fontFamily).toBe('Playfair Display');
    });

    it('renders HierarchicalCardsSection with parent cards and subCards', () => {
      const mockCards = [
        {
          id: 'card-1',
          title: 'Gói Trị Liệu Trẻ Hóa VIP',
          subHeader: 'Liệu trình 90 phút',
          content: 'Thư giãn toàn diện với thảo dược tự nhiên.',
          stylePreset: 'luxury',
          subCards: [
            {
              id: 'sub-1',
              title: 'Xông hơi tinh dầu',
              subHeader: '20 phút',
              content: 'Tẩy độc tố da',
            },
            {
              id: 'sub-2',
              title: 'Massage đá nóng',
              subHeader: '70 phút',
              content: 'Lưu thông khí huyết',
            },
          ],
        },
      ];

      render(<HierarchicalCardsSection hierarchicalCards={mockCards} />);

      expect(screen.getByTestId('hierarchical-cards-section')).toBeInTheDocument();
      expect(screen.getByText('Gói Trị Liệu Trẻ Hóa VIP')).toBeInTheDocument();
      expect(screen.getByText('Liệu trình 90 phút')).toBeInTheDocument();
      expect(screen.getByText('Xông hơi tinh dầu')).toBeInTheDocument();
      expect(screen.getByText('Massage đá nóng')).toBeInTheDocument();
    });

    it('publishCommunityTemplate dispatches POST /templates/community via API client', async () => {
      api.post.mockResolvedValueOnce({ data: { success: true, data: 'guid-1234' } });

      const templateData = {
        name: 'Mẫu Cưới Mùa Thu',
        slug: 'mau-cuoi-mua-thu',
        category: 'Wedding',
        thumbnailUrl: 'https://thumb.url',
        defaultConfigJson: '{"theme":{}}',
        authorName: 'Hoàng Yến',
      };

      const res = await templateApi.publishCommunityTemplate(templateData);

      expect(api.post).toHaveBeenCalledWith('/templates/community', templateData);
      expect(res.data).toBe('guid-1234');
    });

    it('getTemplates correctly appends isCommunity query param', async () => {
      api.get.mockResolvedValueOnce({ data: { success: true, data: [] } });

      await templateApi.getTemplates({ isCommunity: true });

      expect(api.get).toHaveBeenCalledWith('/templates', {
        params: expect.objectContaining({ isCommunity: true }),
      });
    });

    it('vercel.json specifies single-page application rewrite rule to /index.html', () => {
      expect(vercelConfig).toBeDefined();
      expect(vercelConfig.rewrites).toBeDefined();
      expect(Array.isArray(vercelConfig.rewrites)).toBe(true);
      const spaRewrite = vercelConfig.rewrites.find(
        (r) => r.destination === '/index.html'
      );
      expect(spaRewrite).toBeDefined();
      const route = new RegExp('^' + spaRewrite.source + '$');
      expect(route.test('/t/acme/templates')).toBe(true);
      expect(route.test('/assets/missing.js')).toBe(false);
      expect(route.test('/api/v1/templates')).toBe(false);
      expect(route.test('/t/acme/api/v1/landing/templates')).toBe(false);
    });

    it('animationConstants defines entrance, continuous groups and 7 distinct particle options', () => {
      expect(ANIMATION_GROUPS).toHaveLength(2);
      expect(ANIMATION_GROUPS[0].groupId).toBe('entrance');
      expect(ANIMATION_GROUPS[1].groupId).toBe('continuous');
      expect(ANIMATION_OPTIONS.length).toBeGreaterThan(10);

      // Verify 7 particles + none
      expect(PARTICLES_OPTIONS).toHaveLength(8);
      const particleValues = PARTICLES_OPTIONS.map((p) => p.value);
      expect(particleValues).toContain('petals');
      expect(particleValues).toContain('confetti');
      expect(particleValues).toContain('sparkles');
      expect(particleValues).toContain('snow');
      expect(particleValues).toContain('bubbles');
      expect(particleValues).toContain('fireflies');
      expect(particleValues).toContain('cyber-grid');
    });
  });

  describe('2. Edge Cases (Trường hợp biên & An toàn giao diện)', () => {
    it('applyPaletteToConfig safely returns unchanged config when palette is null or undefined', () => {
      const config = { theme: { primaryColor: '#ffffff' } };
      expect(applyPaletteToConfig(config, null)).toBe(config);
      expect(applyPaletteToConfig(config, undefined)).toBe(config);
    });

    it('HierarchicalCardsSection returns null when hierarchicalCards is null, undefined or empty array', () => {
      const { container: c1 } = render(<HierarchicalCardsSection hierarchicalCards={null} />);
      expect(c1.firstChild).toBeNull();

      const { container: c2 } = render(<HierarchicalCardsSection hierarchicalCards={undefined} />);
      expect(c2.firstChild).toBeNull();

      const { container: c3 } = render(<HierarchicalCardsSection hierarchicalCards={[]} />);
      expect(c3.firstChild).toBeNull();
    });

    it('HierarchicalCardsSection safely handles card without subCards or non-array subCards', () => {
      const cardsWithoutSub = [
        {
          id: 'card-isolated',
          title: 'Thẻ Đơn Không Mục Con',
          content: 'Chỉ có nội dung chính',
          subCards: null,
        },
      ];

      render(<HierarchicalCardsSection hierarchicalCards={cardsWithoutSub} />);
      expect(screen.getByText('Thẻ Đơn Không Mục Con')).toBeInTheDocument();
      expect(screen.getByText('Chỉ có nội dung chính')).toBeInTheDocument();
    });

    it('DeviceSimulator switches between iOS and Android operating systems', () => {
      render(
        <DeviceSimulator showToolbar={true} initialOs="ios">
          <div data-testid="simulated-content">Simulated Landing Page</div>
        </DeviceSimulator>
      );

      expect(screen.getByTestId('simulated-content')).toBeInTheDocument();

      // Switch to Android
      const androidBtn = screen.getByRole('button', { name: /android/i });
      fireEvent.click(androidBtn);

      // Verify content is still mounted in new simulator frame
      expect(screen.getByTestId('simulated-content')).toBeInTheDocument();
    });

    it('DEVICE_CATALOG contains valid dimensions, bezel widths, and notch types across all devices', () => {
      const allDevices = [...DEVICE_CATALOG.ios, ...DEVICE_CATALOG.android];
      expect(allDevices.length).toBeGreaterThanOrEqual(8);

      allDevices.forEach((device) => {
        expect(device.id).toBeDefined();
        expect(device.name).toBeDefined();
        expect(device.width).toBeGreaterThan(300);
        expect(device.height).toBeGreaterThan(600);
        expect(device.bezelWidth).toMatch(/^border-\[\d+px\]$/);
        expect(device.borderRadius).toMatch(/^rounded-\[\d+px\]$/);
        expect(device.screenRadius).toMatch(/^rounded-\[\d+px\]$/);
        expect(['dynamic-island', 'classic-bezel', 'tablet', 'punch-hole-center']).toContain(
          device.notchType
        );
      });
    });

    it('getAnimationClass safely handles invalid animation keys, null, and undefined', () => {
      // Invalid animation key when visible falls back to animate-fade-up
      const fallbackVisible = getAnimationClass('non-existent-animation-key', true);
      expect(fallbackVisible).toContain('animate-fade-up');

      // Invalid animation key when invisible falls back to safe translate-y
      const fallbackInvisible = getAnimationClass('non-existent-animation-key', false);
      expect(fallbackInvisible).toContain('opacity-0');

      // Null, empty string, or 'none' falls back to 'none' (opacity-100)
      expect(getAnimationClass(null, true)).toBe('opacity-100');
      expect(getAnimationClass('', true)).toBe('opacity-100');
      expect(getAnimationClass('none', true)).toBe('opacity-100');

      // Undefined triggers default parameter 'fade-up'
      expect(getAnimationClass(undefined, true)).toContain('animate-fade-up');
    });

    it('HierarchicalCardsSection gracefully handles missing title or content in cards', () => {
      const incompleteCards = [
        {
          id: 'card-partial',
          // missing title and subHeader
          content: 'Nội dung không có tiêu đề',
          subCards: [
            {
              id: 'sub-partial',
              content: 'Nội dung con không tiêu đề',
            },
          ],
        },
      ];

      render(<HierarchicalCardsSection hierarchicalCards={incompleteCards} />);
      expect(screen.getByText('Nội dung không có tiêu đề')).toBeInTheDocument();
      expect(screen.getByText('Nội dung con không tiêu đề')).toBeInTheDocument();
    });
  });

  describe('3. Failure Paths (Kỳ vọng thất bại & Xử lý lỗi)', () => {
    it('publishCommunityTemplate rejects when API returns 400 validation error', async () => {
      api.post.mockRejectedValueOnce(new Error('Slug không được để trống.'));

      await expect(
        templateApi.publishCommunityTemplate({ name: 'Test', slug: '' })
      ).rejects.toThrow('Slug không được để trống.');
    });

    it('publishCommunityTemplate rejects when network failure or 500 error occurs', async () => {
      api.post.mockRejectedValueOnce(new Error('Network error: Unable to connect to backend service'));

      await expect(
        templateApi.publishCommunityTemplate({ name: 'Test Network Error', slug: 'test-slug' })
      ).rejects.toThrow(/Network error/);
    });
  });
});
