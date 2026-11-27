export function orientPrintSize(widthPx, heightPx, widthCm, heightCm) {
  if (widthPx !== heightPx && widthCm !== heightCm && (widthPx > heightPx) !== (widthCm > heightCm)) {
    return { widthCm: heightCm, heightCm: widthCm };
  }
  return { widthCm, heightCm };
}

export function evaluatePhotoPrintQuality(widthPx, heightPx, targetWidthCm, targetHeightCm) {
  if (![widthPx, heightPx, targetWidthCm, targetHeightCm].every(value => Number.isFinite(Number(value)) && Number(value) > 0)) {
    return { dpi: 0, level: 'low', label: 'Chưa xác định được độ phân giải' };
  }
  const target = orientPrintSize(Number(widthPx), Number(heightPx), Number(targetWidthCm), Number(targetHeightCm));
  const dpi = Math.floor(2.54 * Math.min(widthPx / target.widthCm, heightPx / target.heightCm));
  if (dpi >= 250) return { dpi, level: 'high', label: 'Rất nét' };
  if (dpi >= 150) return { dpi, level: 'medium', label: 'Đạt chuẩn' };
  return { dpi, level: 'low', label: 'Nên chọn cỡ nhỏ hơn hoặc dùng ảnh gốc' };
}

export function getPhotoBox(width, height, imageWidth, imageHeight, { fitMode = 'Fill', focalX = 0.5, focalY = 0.5 } = {}) {
  const scale = fitMode === 'Fit' ? Math.min(width / imageWidth, height / imageHeight) : Math.max(width / imageWidth, height / imageHeight);
  const scaledWidth = imageWidth * scale, scaledHeight = imageHeight * scale;
  return {
    x: (width - scaledWidth) * (fitMode === 'Fit' ? 0.5 : focalX),
    y: (height - scaledHeight) * (fitMode === 'Fit' ? 0.5 : focalY),
    width: scaledWidth, height: scaledHeight,
  };
}
