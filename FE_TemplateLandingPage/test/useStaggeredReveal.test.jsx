import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useStaggeredReveal } from '../src/hooks/useStaggeredReveal';

function StaggerTestComponent({ totalItems = 4, staggerMs = 100, threshold = 0.15 }) {
  const { containerRef, isItemVisible, visibleIndices } = useStaggeredReveal({
    totalItems,
    staggerMs,
    threshold,
  });

  return (
    <div ref={containerRef} data-testid="stagger-container">
      {Array.from({ length: totalItems }).map((_, idx) => (
        <div
          key={idx}
          data-testid={`item-${idx}`}
          data-visible={isItemVisible(idx) ? 'true' : 'false'}
        >
          Item {idx}
        </div>
      ))}
      <span data-testid="visible-count">{visibleIndices.size}</span>
    </div>
  );
}

describe('useStaggeredReveal Hook', () => {
  let originalIntersectionObserver;

  beforeEach(() => {
    vi.useFakeTimers();
    originalIntersectionObserver = window.IntersectionObserver;
  });

  afterEach(() => {
    vi.useRealTimers();
    window.IntersectionObserver = originalIntersectionObserver;
    vi.restoreAllMocks();
  });

  describe('Happy Paths (Đường chạy thuận lợi)', () => {
    it('observes container and sequentially reveals items with stagger delay upon intersection', () => {
      let observerCallback = null;
      const unobserveMock = vi.fn();
      const disconnectMock = vi.fn();

      class MockIntersectionObserver {
        constructor(callback) {
          observerCallback = callback;
        }
        observe() {}
        unobserve = unobserveMock;
        disconnect = disconnectMock;
      }
      window.IntersectionObserver = MockIntersectionObserver;

      render(<StaggerTestComponent totalItems={3} staggerMs={150} />);

      // Initially no items should be revealed
      expect(screen.getByTestId('item-0')).toHaveAttribute('data-visible', 'false');
      expect(screen.getByTestId('item-1')).toHaveAttribute('data-visible', 'false');
      expect(screen.getByTestId('item-2')).toHaveAttribute('data-visible', 'false');
      expect(screen.getByTestId('visible-count')).toHaveTextContent('0');

      // Trigger intersection
      act(() => {
        observerCallback([{ isIntersecting: true, target: screen.getByTestId('stagger-container') }]);
        vi.advanceTimersByTime(0);
      });

      // Item 0 triggers at 0ms
      expect(screen.getByTestId('item-0')).toHaveAttribute('data-visible', 'true');
      expect(screen.getByTestId('item-1')).toHaveAttribute('data-visible', 'false');
      expect(screen.getByTestId('visible-count')).toHaveTextContent('1');

      // Advance 150ms -> Item 1 visible
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(screen.getByTestId('item-1')).toHaveAttribute('data-visible', 'true');
      expect(screen.getByTestId('item-2')).toHaveAttribute('data-visible', 'false');
      expect(screen.getByTestId('visible-count')).toHaveTextContent('2');

      // Advance another 150ms -> Item 2 visible
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(screen.getByTestId('item-2')).toHaveAttribute('data-visible', 'true');
      expect(screen.getByTestId('visible-count')).toHaveTextContent('3');

      expect(unobserveMock).toHaveBeenCalled();
    });
  });

  describe('Edge Cases (Trường hợp biên)', () => {
    it('reveals items immediately when IntersectionObserver is not supported', () => {
      delete window.IntersectionObserver;

      render(<StaggerTestComponent totalItems={3} staggerMs={100} />);

      // At 0ms tick, item 0 is revealed
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(screen.getByTestId('item-0')).toHaveAttribute('data-visible', 'true');
      expect(screen.getByTestId('item-1')).toHaveAttribute('data-visible', 'false');

      // Advance by remaining stagger
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByTestId('item-1')).toHaveAttribute('data-visible', 'true');
      expect(screen.getByTestId('item-2')).toHaveAttribute('data-visible', 'true');
      expect(screen.getByTestId('visible-count')).toHaveTextContent('3');
    });

    it('handles totalItems = 0 without error and resets visible indices', () => {
      class MockIntersectionObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
      window.IntersectionObserver = MockIntersectionObserver;

      const { rerender } = render(<StaggerTestComponent totalItems={3} staggerMs={100} />);

      rerender(<StaggerTestComponent totalItems={0} staggerMs={100} />);

      expect(screen.getByTestId('visible-count')).toHaveTextContent('0');
    });

    it('disconnects observer and clears pending stagger timeouts on unmount', () => {
      const disconnectMock = vi.fn();
      let observerCallback = null;

      class MockIntersectionObserver {
        constructor(callback) {
          observerCallback = callback;
        }
        observe() {}
        unobserve() {}
        disconnect = disconnectMock;
      }
      window.IntersectionObserver = MockIntersectionObserver;

      const { unmount } = render(<StaggerTestComponent totalItems={4} staggerMs={200} />);

      // Trigger intersection
      act(() => {
        observerCallback([{ isIntersecting: true, target: screen.getByTestId('stagger-container') }]);
        vi.advanceTimersByTime(0);
      });

      expect(screen.getByTestId('visible-count')).toHaveTextContent('1');

      // Unmount before all items are revealed
      unmount();
      expect(disconnectMock).toHaveBeenCalled();

      // Advancing time should not throw or cause state updates after unmount
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    });
  });
});
