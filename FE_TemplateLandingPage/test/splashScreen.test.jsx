import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SplashScreen from '../src/components/home/SplashScreen';

describe('SplashScreen Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Happy Paths (Đường chạy thuận lợi)', () => {
    it('renders MotionSites brand and progress bar', () => {
      render(<SplashScreen onComplete={vi.fn()} durationMs={2000} />);

      expect(screen.getByRole('status', { name: /loading splash screen/i })).toBeInTheDocument();
      expect(screen.getByText('Motion')).toBeInTheDocument();
      expect(screen.getByText('Sites')).toBeInTheDocument();
      expect(screen.getByText(/cinelove template engine/i)).toBeInTheDocument();
      expect(screen.getByText(/đang khởi tạo không gian tương tác/i)).toBeInTheDocument();
    });

    it('smoothly counts to 100%, applies hold delay, fade-out, and calls onComplete', () => {
      const onCompleteMock = vi.fn();

      const { container } = render(
        <SplashScreen
          onComplete={onCompleteMock}
          durationMs={2000}
          holdDelayMs={200}
          fadeDurationMs={700}
        />
      );
      const splashContainer = container.querySelector('[role="status"]');
      expect(splashContainer).toHaveClass('opacity-100');

      // Advance timer by durationMs + extra frame time to reach linearProgress >= 1 and trigger finish()
      act(() => {
        vi.advanceTimersByTime(2100);
      });

      // Progress reaches 100%
      expect(screen.getByText('100')).toBeInTheDocument();

      // Hold delay of 200ms before fade-out begins
      expect(splashContainer).not.toHaveClass('opacity-0');
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(splashContainer).toHaveClass('opacity-0');

      // onComplete should NOT be called before fade-out timer (700ms) completes
      expect(onCompleteMock).not.toHaveBeenCalled();

      // Advance fade-out timer (700ms)
      act(() => {
        vi.advanceTimersByTime(700);
      });

      expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases (Trường hợp biên)', () => {
    it('activates safety fallback timer when requestAnimationFrame stalls or is delayed', () => {
      const onCompleteMock = vi.fn();

      // Mock requestAnimationFrame to NOT call callback (simulate stalling/tab hidden)
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 12345);

      const { container } = render(
        <SplashScreen
          onComplete={onCompleteMock}
          durationMs={2000}
          holdDelayMs={200}
          fadeDurationMs={700}
        />
      );
      const splashContainer = container.querySelector('[role="status"]');

      // Fallback is Math.max(2000 + 200 + 600, 3000) -> 3000ms
      act(() => {
        vi.advanceTimersByTime(2999);
      });
      expect(onCompleteMock).not.toHaveBeenCalled();

      // Trigger fallback at 3000ms
      act(() => {
        vi.advanceTimersByTime(1);
      });

      // Hold delay (200ms)
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(splashContainer).toHaveClass('opacity-0');

      // Advance fade-out timer (700ms)
      act(() => {
        vi.advanceTimersByTime(700);
      });

      expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });

    it('cleans up animationFrame and all timers on unmount', () => {
      const cancelAnimSpy = vi.spyOn(window, 'cancelAnimationFrame');
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
      const onCompleteMock = vi.fn();

      const { unmount } = render(<SplashScreen onComplete={onCompleteMock} durationMs={2000} />);

      unmount();

      expect(cancelAnimSpy).toHaveBeenCalled();
      expect(clearTimeoutSpy).toHaveBeenCalled();

      // Advance time and ensure onComplete is never called after unmount
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onCompleteMock).not.toHaveBeenCalled();
    });
  });
});
