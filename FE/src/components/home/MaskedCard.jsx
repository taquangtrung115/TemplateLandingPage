import React from 'react';

/**
 * MaskedCard Component
 * Hiển thị thẻ card chia sẻ chung một ảnh nền với các card khác trong container.
 * Nhờ tính toán background-position âm và focalOffset, các phần ảnh được ghép nối
 * khớp chính xác từng pixel như một bức tranh mosaic hoàn chỉnh.
 *
 * @param {Object} props
 * @param {string} [props.bgImage] URL ảnh nền chung
 * @param {Object} [props.position] Tọa độ và kích thước tính từ useMaskPositions { x, y, sw, sh, width, height }
 * @param {number} [props.renderWidth] Chiều rộng render của ảnh nền tính từ useImageWidth
 * @param {number} [props.renderHeight] Chiều cao render của ảnh nền
 * @param {number} [props.focalX=0.8] Tỷ lệ tiêu cự focal point (desktop: 0.8, mobile: 0.7)
 * @param {string} [props.className='']
 * @param {React.ReactNode} [props.children]
 * @param {React.CSSProperties} [props.style={}]
 */
export default function MaskedCard({
  bgImage,
  position = { x: 0, y: 0, sw: 1200, sh: 800 },
  renderWidth = 1920,
  renderHeight,
  focalX = 0.8,
  className = '',
  children,
  style = {},
  ...rest
}) {
  const containerW = position?.sw || renderWidth || 1200;
  const containerH = position?.sh || 800;

  const overflow = Math.max(0, renderWidth - containerW);
  const focalOffset = overflow * focalX;

  const bgX = -Math.round((position?.x || 0) + focalOffset);
  const bgY = -Math.round(position?.y || 0);
  const bgW = Math.round(renderWidth);
  const bgH = Math.round(renderHeight || containerH);

  const backgroundStyles = bgImage
    ? {
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundRepeat: 'no-repeat',
      }
    : {};

  return (
    <div
      data-testid="masked-card"
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      style={{
        ...backgroundStyles,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
