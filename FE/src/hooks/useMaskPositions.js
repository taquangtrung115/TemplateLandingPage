import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook useMaskPositions
 * Theo dõi kích thước container và tính toán tọa độ offset tương đối {x, y, sw, sh, width, height}
 * của từng card con so với container cha để tạo hiệu ứng masked background đồng bộ.
 *
 * @param {number} totalCards Số lượng card cần tính offset
 * @returns {{
 *   containerRef: React.RefObject<HTMLElement>,
 *   cardRefs: React.MutableRefObject<Array<HTMLElement | null>>,
 *   registerCardRef: (index: number) => (el: HTMLElement | null) => void,
 *   positions: Array<{ x: number, y: number, sw: number, sh: number, width: number, height: number }>,
 *   containerSize: { width: number, height: number }
 * }}
 */
export function useMaskPositions(totalCards = 0) {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [positions, setPositions] = useState(() =>
    Array.from({ length: totalCards }, () => ({
      x: 0,
      y: 0,
      sw: 1200,
      sh: 800,
      width: 300,
      height: 200,
    }))
  );

  const calculatePositions = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const cRect = container.getBoundingClientRect();
    const sw = cRect.width || 1200;
    const sh = cRect.height || 800;

    setContainerSize({ width: sw, height: sh });

    const newPositions = [];
    for (let i = 0; i < totalCards; i++) {
      const cardEl = cardRefs.current[i];
      if (cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        newPositions.push({
          x: Math.max(0, cardRect.left - cRect.left),
          y: Math.max(0, cardRect.top - cRect.top),
          width: cardRect.width,
          height: cardRect.height,
          sw,
          sh,
        });
      } else {
        newPositions.push({
          x: 0,
          y: 0,
          width: 300,
          height: 200,
          sw,
          sh,
        });
      }
    }

    setPositions(newPositions);
  }, [totalCards]);

  const registerCardRef = useCallback(
    (index) => (el) => {
      cardRefs.current[index] = el;
    },
    []
  );

  useEffect(() => {
    calculatePositions();

    // ResizeObserver hỗ trợ container resize
    let observer = null;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      observer = new window.ResizeObserver(() => {
        calculatePositions();
      });

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
      cardRefs.current.forEach((el) => {
        if (el) observer.observe(el);
      });
    }

    const handleWindowResize = () => {
      calculatePositions();
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [calculatePositions, totalCards]);

  return {
    containerRef,
    cardRefs,
    registerCardRef,
    positions,
    containerSize,
  };
}

export default useMaskPositions;
