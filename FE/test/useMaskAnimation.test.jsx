import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import { useMaskPositions } from '../src/hooks/useMaskPositions';
import { useImageWidth } from '../src/hooks/useImageWidth';
import MaskedCard from '../src/components/home/MaskedCard';

describe('Masked Animation Hooks & MaskedCard Component', () => {
  describe('useMaskPositions Hook', () => {
    it('returns default layout positions when totalCards is provided', () => {
      const { result } = renderHook(() => useMaskPositions(4));

      expect(result.current.positions).toHaveLength(4);
      expect(result.current.positions[0]).toMatchObject({
        x: 0,
        y: 0,
        sw: 1200,
        sh: 800,
      });
      expect(typeof result.current.registerCardRef).toBe('function');
    });

    it('gracefully handles missing ResizeObserver in test/JSDOM environments without crashing', () => {
      const originalRO = window.ResizeObserver;
      delete window.ResizeObserver;

      expect(() => {
        const { result } = renderHook(() => useMaskPositions(3));
        expect(result.current.positions).toHaveLength(3);
      }).not.toThrow();

      window.ResizeObserver = originalRO;
    });
  });

  describe('useImageWidth Hook', () => {
    const originalInnerWidth = window.innerWidth;

    afterEach(() => {
      window.innerWidth = originalInnerWidth;
    });

    it('computes focalX 0.8 for desktop viewports (>= 768px)', () => {
      window.innerWidth = 1200;
      const { result } = renderHook(() => useImageWidth(800, 16 / 9));

      expect(result.current.isMobile).toBe(false);
      expect(result.current.focalX).toBe(0.8);
      // 800 * 16/9 = 1422.22 -> Math.max(1200, 1422.22) = 1422
      expect(result.current.renderWidth).toBeGreaterThanOrEqual(1422);
    });

    it('computes focalX 0.7 for mobile viewports (< 768px)', () => {
      window.innerWidth = 375;
      const { result } = renderHook(() => useImageWidth(600, 16 / 9));

      expect(result.current.isMobile).toBe(true);
      expect(result.current.focalX).toBe(0.7);
      // 600 * 16/9 = 1066.66 -> Math.max(375, 1067) = 1067
      expect(result.current.renderWidth).toBeGreaterThanOrEqual(1066);
    });

    it('recalculates on window resize events', () => {
      window.innerWidth = 1024;
      const { result } = renderHook(() => useImageWidth(700, 16 / 9));
      expect(result.current.isMobile).toBe(false);

      act(() => {
        window.innerWidth = 500;
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.isMobile).toBe(true);
      expect(result.current.focalX).toBe(0.7);
    });
  });

  describe('MaskedCard Component', () => {
    it('applies negative background-position and scaled background-size based on focalOffset', () => {
      const position = { x: 100, y: 50, sw: 1000, sh: 600, width: 200, height: 150 };
      const renderWidth = 1400; // overflow = 1400 - 1000 = 400. focalOffset = 400 * 0.8 = 320.
      // bgX = -(100 + 320) = -420px. bgY = -50px.

      render(
        <MaskedCard
          bgImage="https://example.com/test-bg.jpg"
          position={position}
          renderWidth={renderWidth}
          focalX={0.8}
        >
          <span>Card Content</span>
        </MaskedCard>
      );

      const card = screen.getByTestId('masked-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
      expect(card.style.backgroundImage).toContain('https://example.com/test-bg.jpg');
      expect(card.style.backgroundPosition).toBe('-420px -50px');
      expect(card.style.backgroundSize).toBe('1400px 600px');
    });

    it('renders cleanly without crashing when bgImage or position is omitted', () => {
      render(
        <MaskedCard>
          <span>Safe Card</span>
        </MaskedCard>
      );

      const card = screen.getByTestId('masked-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Safe Card')).toBeInTheDocument();
    });

    it('ensures focalOffset is non-negative when renderWidth < containerWidth (overflow <= 0)', () => {
      // container width sw = 1600, but renderWidth = 1200 -> overflow = max(0, 1200 - 1600) = 0.
      // focalOffset must be 0, so background-position X is exactly -x = -150px
      const position = { x: 150, y: 75, sw: 1600, sh: 900, width: 300, height: 200 };
      const renderWidth = 1200;

      render(
        <MaskedCard
          bgImage="https://example.com/test-overflow.jpg"
          position={position}
          renderWidth={renderWidth}
          focalX={0.8}
        >
          <span>Zero Overflow Card</span>
        </MaskedCard>
      );

      const card = screen.getByTestId('masked-card');
      expect(card.style.backgroundPosition).toBe('-150px -75px');
      expect(card.style.backgroundSize).toBe('1200px 900px');
    });

    it('gracefully handles missing or malformed position object without throwing', () => {
      expect(() => {
        render(
          <MaskedCard
            bgImage="https://example.com/malformed.jpg"
            position={null}
            renderWidth={undefined}
            renderHeight={undefined}
          >
            <span>Malformed Card</span>
          </MaskedCard>
        );
      }).not.toThrow();

      const card = screen.getByTestId('masked-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Malformed Card')).toBeInTheDocument();
    });
  });
});
