import { getPhotoBox } from '../../utils/photoQuality';

export function loadImage(src) {
  if (!src) return Promise.resolve(null);
  return new Promise(resolve => {
    const image = new Image();
    if (/^https?:/i.test(src) && new URL(src).origin !== window.location.origin) image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export function drawPhoto(context, image, x, y, width, height, options) {
  context.fillStyle = '#fff';
  context.fillRect(x, y, width, height);
  if (!image) return;
  const box = getPhotoBox(width, height, image.naturalWidth, image.naturalHeight, options);
  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.drawImage(image, x + box.x, y + box.y, box.width, box.height);
  context.restore();
}

export function drawPrintSurface(canvas, images, options) {
  const { model, widthCm, heightCm, hasMatboard, caption, captionFont, borderTone, frameColor } = options;
  const ratio = Math.min(4, Math.max(0.25, widthCm / heightCm || 1));
  canvas.width = ratio >= 1 ? 960 : Math.round(960 * ratio);
  canvas.height = ratio >= 1 ? Math.round(960 / ratio) : 960;
  const { width, height } = canvas;
  const context = canvas.getContext('2d');
  const framed = model === 'framed_photo';
  const polaroid = model === 'polaroid_card';
  const border = Math.min(width, height) * (framed && hasMatboard ? 0.13 : polaroid ? 0.07 : 0.02);
  const base = polaroid ? ({ cream: '#f5e9d1', black: '#282325' }[borderTone] || '#fff') : '#f6f0e3';
  context.fillStyle = base;
  context.fillRect(0, 0, width, height);

  if (model === 'photobook_open') {
    const half = width / 2;
    drawPhoto(context, images[0], border, border, half - border * 2, height - border * 2, options);
    drawPhoto(context, images[1] || images[0], half + border, border, half - border * 2, height - border * 2, options);
    const fold = context.createLinearGradient(half - 16, 0, half + 16, 0);
    fold.addColorStop(0, 'transparent');
    fold.addColorStop(0.5, '#26170848');
    fold.addColorStop(1, 'transparent');
    context.fillStyle = fold;
    context.fillRect(half - 16, 0, 32, height);
    return;
  }

  const captionBand = polaroid ? height * 0.17 : 0;
  drawPhoto(context, images[0], border, border, width - border * 2, height - border * 2 - captionBand, options);

  if (polaroid && caption) {
    const families = { serif: 'Georgia, serif', sans: 'system-ui, sans-serif', script: 'cursive' };
    context.fillStyle = borderTone === 'black' ? '#fff' : '#2d2420';
    context.font = Math.round(captionBand * 0.28) + 'px ' + (families[captionFont] || families.serif);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(caption, width / 2, height - (border + captionBand) / 2, width - border * 2);
  }

  if (framed && options.paintFrame) {
    context.strokeStyle = frameColor;
    context.lineWidth = Math.max(8, border * 0.3);
    context.strokeRect(0, 0, width, height);
  }
}
