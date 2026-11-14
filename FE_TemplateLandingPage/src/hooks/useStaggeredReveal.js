import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook quan sát danh sách phần tử và kích hoạt hiển thị so le
 * @param {Object} options
 * @param {number} [options.threshold=0.15]
 * @param {string} [options.rootMargin='0px 0px -50px 0px']
 * @param {number} [options.staggerMs=120]
 * @param {number} [options.totalItems=0]
 * @returns {{ containerRef: React.RefObject, isItemVisible: (index: number) => boolean, visibleIndices: Set<number> }}
 */
export function useStaggeredReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -50px 0px',
  staggerMs = 120,
  totalItems = 0,
} = {}) {
  const containerRef = useRef(null);
  const [visibleIndices, setVisibleIndices] = useState(() => new Set());
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Reset if totalItems becomes 0
    if (totalItems <= 0) {
      setVisibleIndices(new Set());
      hasTriggeredRef.current = false;
      return;
    }

    const timeouts = [];

    const triggerStagger = () => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;

      for (let i = 0; i < totalItems; i++) {
        const t = setTimeout(() => {
          setVisibleIndices((prev) => {
            const next = new Set(prev);
            next.add(i);
            return next;
          });
        }, i * staggerMs);
        timeouts.push(t);
      }
    };

    // If IntersectionObserver is unavailable (e.g. testing or older browser), trigger immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      triggerStagger();
      return () => {
        timeouts.forEach(clearTimeout);
      };
    }

    const element = containerRef.current;
    if (!element) {
      // Fallback: trigger after a short tick if containerRef not yet attached
      const fallbackTimer = setTimeout(triggerStagger, 300);
      timeouts.push(fallbackTimer);
      return () => {
        timeouts.forEach(clearTimeout);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerStagger();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      timeouts.forEach(clearTimeout);
    };
  }, [totalItems, staggerMs, threshold, rootMargin]);

  const isItemVisible = useCallback(
    (index) => visibleIndices.has(index),
    [visibleIndices]
  );

  return {
    containerRef,
    isItemVisible,
    visibleIndices,
  };
}

export default useStaggeredReveal;
