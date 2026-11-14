import { useState, useEffect } from 'react';

/**
 * Hook useImageWidth
 * Tính toán chiều rộng hiển thị (renderWidth) của ảnh nền dùng chung dựa trên sectionHeight,
 * naturalAspectRatio (mặc định 16/9) và kích thước viewport hiện tại.
 *
 * @param {number} sectionHeight Chiều cao hiện tại của section container (px)
 * @param {number} [naturalAspectRatio=16/9] Tỷ lệ tự nhiên của ảnh gốc
 * @returns {{
 *   renderWidth: number,
 *   isMobile: boolean,
 *   focalX: number
 * }}
 */
export function useImageWidth(sectionHeight = 0, naturalAspectRatio = 16 / 9) {
  const getIsMobile = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  };

  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
        setWindowWidth(window.innerWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const focalX = isMobile ? 0.7 : 0.8;

  // Chiều rộng tối thiểu là chiều rộng màn hình, hoặc sectionHeight * naturalAspectRatio nếu lớn hơn
  const computedWidth = sectionHeight > 0
    ? Math.max(windowWidth, sectionHeight * naturalAspectRatio)
    : Math.max(windowWidth, 1920);

  const renderWidth = Math.round(computedWidth);

  return {
    renderWidth,
    isMobile,
    focalX,
  };
}

export default useImageWidth;
