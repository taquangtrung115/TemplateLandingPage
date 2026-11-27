import { useImperativeHandle } from 'react';
import { drawPrintSurface, loadImage } from './photoCanvas';

export default function Fallback25DViewer({ ref, options }) {
  const { model, src, rightSrc, frameColor, hasMatboard, fitMode, focalX, focalY, caption, captionFont, borderTone, widthCm, heightCm, warm } = options;
  useImperativeHandle(ref, () => ({
    resetCamera() {},
    async captureSnapshot() {
      const images = await Promise.all([loadImage(src), loadImage(rightSrc)]);
      const canvas = document.createElement('canvas');
      drawPrintSurface(canvas, images, { ...options, paintFrame: true });
      return canvas.toDataURL('image/png');
    },
  }), [options, src, rightSrc]);
  const ratio = Math.min(4, Math.max(0.25, widthCm / heightCm || 1));
  const position = { objectFit: fitMode === 'Fit' ? 'contain' : 'cover', objectPosition: (focalX ?? 0.5) * 100 + '% ' + (focalY ?? 0.5) * 100 + '%' };
  return <div className={'fallback-stage' + (warm ? ' warm' : '')} aria-label="Xem trước ảnh 2.5D">
    <div className={'fallback-model ' + model + (hasMatboard && model === 'framed_photo' ? ' with-mat' : '')}
      style={{ '--preview-ratio': ratio, '--frame': frameColor, '--border-tone': { cream: '#f5e9d1', black: '#282325' }[borderTone] || '#fff' }}>
      <div className="fallback-prints">
        {src && <img src={src} alt="Ảnh trên thành phẩm" style={position} />}
        {model === 'photobook_open' && (rightSrc || src) && <img src={rightSrc || src} alt="Trang phải" style={position} />}
      </div>
      {model === 'polaroid_card' && <div className="fallback-caption" style={{ fontFamily: { serif: 'Georgia', script: 'cursive', sans: 'system-ui' }[captionFont], color: borderTone === 'black' ? '#fff' : '#24201c' }}>{caption}</div>}
    </div>
  </div>;
}
