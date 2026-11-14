import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPageRenderer from '../src/components/templates/LandingPageRenderer';
import {
  DEFAULT_WEDDING_CONFIG,
  DEFAULT_AI_SUMMIT_CONFIG,
  DEFAULT_DRIFT_PLANNER_CONFIG,
  DEFAULT_DENTAL_CLINIC_CONFIG,
  DEFAULT_MODERN_SAAS_CONFIG,
  DEFAULT_KIDS_PARTY_CONFIG,
  DEFAULT_BIRTHDAY_CONFIG,
  getDefaultConfigByCategory,
} from '../src/utils/defaultTemplates';

describe('Diverse Landing Page Formats & Sections', () => {
  describe('getDefaultConfigByCategory mapping', () => {
    it('correctly maps conference and summit categories to AI Summit format', () => {
      const config1 = getDefaultConfigByCategory('conference');
      expect(config1.format).toBe('summit');
      expect(config1.speakers).toBeDefined();
      expect(config1.speakers.length).toBeGreaterThan(0);

      const config2 = getDefaultConfigByCategory('ai-summit');
      expect(config2.format).toBe('summit');
    });

    it('correctly maps app-showcase to Drift Planner format', () => {
      const config = getDefaultConfigByCategory('app-showcase');
      expect(config.format).toBe('app-showcase');
      expect(config.featureCardsGrid).toBeDefined();
      expect(config.hero.videoUrl).toBeDefined();
    });

    it('correctly maps medical and dental categories to Dental Clinic format', () => {
      const config = getDefaultConfigByCategory('medical');
      expect(config.format).toBe('dental-services');
      expect(config.servicesGrid).toBeDefined();
      expect(config.treatmentProcess).toBeDefined();
    });

    it('correctly maps saas category to Modern SaaS format', () => {
      const config = getDefaultConfigByCategory('saas');
      expect(config.format).toBe('saas');
      expect(config.pricingPackages).toBeDefined();
      expect(config.featureCardsGrid.length).toBeGreaterThanOrEqual(6);
    });

    it('correctly maps kids-birthday category to WonderKids Party format', () => {
      const config = getDefaultConfigByCategory('kids-birthday');
      expect(config.format).toBe('kids-birthday');
      expect(config.hero.title).toContain('Sinh Nhật');
    });

    it('falls back to Wedding format for unknown category', () => {
      const config = getDefaultConfigByCategory('unknown-category');
      expect(config.format).toBe('wedding');
    });
  });

  describe('LandingPageRenderer Rendering Diverse Formats', () => {
    it('renders SpeakersSection and PricingSection when rendering DEFAULT_AI_SUMMIT_CONFIG', () => {
      render(<LandingPageRenderer config={DEFAULT_AI_SUMMIT_CONFIG} isPreview={true} />);

      // Section 1: Hero
      expect(screen.getAllByText('Generative AI & Future Intelligence').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('GLOBAL VIRTUAL SUMMIT 2026')).toBeInTheDocument();

      // Specialized Speakers Section
      expect(screen.getByTestId('speakers-section')).toBeInTheDocument();
      expect(screen.getByText('Dr. Elena Rostova')).toBeInTheDocument();
      expect(screen.getByText('Chief AI Scientist')).toBeInTheDocument();

      // Specialized Pricing Passes Section
      expect(screen.getByTestId('pricing-section')).toBeInTheDocument();
      expect(screen.getByText('Standard Pass')).toBeInTheDocument();
      expect(screen.getByText('VIP Executive Pass')).toBeInTheDocument();
      expect(screen.getByText('1.490.000 đ')).toBeInTheDocument();
    });

    it('renders FeatureCardsSection and Video Background when rendering DEFAULT_DRIFT_PLANNER_CONFIG', () => {
      const { container } = render(
        <LandingPageRenderer config={DEFAULT_DRIFT_PLANNER_CONFIG} isPreview={true} />
      );

      expect(screen.getAllByText(/Drift.*Năng Suất Nhẹ Nhàng/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('feature-cards-section')).toBeInTheDocument();
      expect(screen.getByText('Time-Blocking Trực Quan')).toBeInTheDocument();
      expect(screen.getByText('Âm Thanh Tập Trung Song Nhĩ')).toBeInTheDocument();

      // Video element in Hero
      const videoEl = container.querySelector('video');
      expect(videoEl).toBeInTheDocument();
    });

    it('renders ServicesSection, 4 dental services, and treatment process when rendering DEFAULT_DENTAL_CLINIC_CONFIG', () => {
      render(<LandingPageRenderer config={DEFAULT_DENTAL_CLINIC_CONFIG} isPreview={true} />);

      expect(screen.getAllByText('Kiến Tạo Nụ Cười Hoàn Hảo & Tự Tin').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('services-section')).toBeInTheDocument();
      expect(screen.getByText('Veneers Sứ Siêu Mỏng')).toBeInTheDocument();
      expect(screen.getByText('Bọc Răng Sứ Thẩm Mỹ')).toBeInTheDocument();
      expect(screen.getByText('Tẩy Trắng Laser Extra-White')).toBeInTheDocument();
      expect(screen.getByText('Cấy Ghép Implant Kỹ Thuật Số')).toBeInTheDocument();
      expect(screen.getByText('Thăm khám & Chụp CT 3D ConeBeam')).toBeInTheDocument();
    });

    it('renders SaaS 6 feature cards and pricing tiers when rendering DEFAULT_MODERN_SAAS_CONFIG', () => {
      render(<LandingPageRenderer config={DEFAULT_MODERN_SAAS_CONFIG} isPreview={true} />);

      expect(screen.getByTestId('feature-cards-section')).toBeInTheDocument();
      expect(screen.getByText('API-First Architecture')).toBeInTheDocument();
      expect(screen.getByText('Realtime Stream Engine')).toBeInTheDocument();
      expect(screen.getByTestId('pricing-section')).toBeInTheDocument();
      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('Business Pro')).toBeInTheDocument();
    });

    it('renders Kids Party Celebration when rendering DEFAULT_KIDS_PARTY_CONFIG', () => {
      render(<LandingPageRenderer config={DEFAULT_KIDS_PARTY_CONFIG} isPreview={true} />);

      expect(screen.getAllByText(/Sinh Nhật Xứ Sở Thần Tiên Của Bé Mia/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('WONDERLAND BIRTHDAY 5TH')).toBeInTheDocument();
      expect(screen.getByText('Bé Mia (Nguyễn Hoàng Kim)')).toBeInTheDocument();
      expect(screen.getByText('Đại Tiệc Sinh Nhật WonderKids')).toBeInTheDocument();
      expect(screen.getByText('Đập kẹo Piñata khổng lồ')).toBeInTheDocument();
    });

    it('backward compatibility: seamlessly renders classic wedding config without errors', () => {
      render(<LandingPageRenderer config={DEFAULT_WEDDING_CONFIG} isPreview={true} />);

      expect(screen.getByText('Minh & Linh')).toBeInTheDocument();
      expect(screen.queryByTestId('speakers-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('services-section')).not.toBeInTheDocument();
      expect(screen.getByText('Lễ Thành Hôn & Tiệc Cưới')).toBeInTheDocument();
    });
  });

  describe('Failure / Constraints & Edge Cases (Kiểm thử an toàn & biên)', () => {
    it('safely renders without throwing when config is null or undefined', () => {
      expect(() => {
        render(<LandingPageRenderer config={null} isPreview={true} />);
      }).not.toThrow();

      expect(() => {
        render(<LandingPageRenderer config={undefined} isPreview={true} />);
      }).not.toThrow();
    });

    it('safely renders without throwing when config is an empty object {}', () => {
      expect(() => {
        render(<LandingPageRenderer config={{}} isPreview={true} />);
      }).not.toThrow();

      expect(screen.getByText(/Motion Landing Page.*Forever & Always/i)).toBeInTheDocument();
    });

    it('safely handles missing or corrupted item data in specialized sections', () => {
      const corruptConfig = {
        format: 'summit',
        speakers: [{ id: 'corrupt-1' }], // missing name, role, avatar
        pricingTickets: [{ id: 'corrupt-t1' }], // missing name, price, perks
        servicesGrid: [{ id: 'corrupt-s1' }], // missing name, desc, priceFrom
        featureCardsGrid: [{ id: 'corrupt-f1' }], // missing title, desc
        booking: { enabled: true },
      };

      expect(() => {
        render(<LandingPageRenderer config={corruptConfig} isPreview={true} />);
      }).not.toThrow();

      expect(screen.getByTestId('speakers-section')).toBeInTheDocument();
      expect(screen.getByTestId('pricing-section')).toBeInTheDocument();
      expect(screen.getByTestId('services-section')).toBeInTheDocument();
      expect(screen.getByTestId('feature-cards-section')).toBeInTheDocument();
    });
  });
});
