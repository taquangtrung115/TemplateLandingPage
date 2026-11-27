export const ModelNames = {
  framed_photo: 'Khung ảnh decor', crystal_mirror: 'Ảnh tráng gương', canvas_wrap: 'Tranh canvas',
  polaroid_card: 'Ảnh Polaroid', photobook_open: 'Photobook mở phẳng',
};
export const FrameColors = { oak: 'Gỗ sồi', black: 'Đen nhám', gold: 'Vàng Champagne', white: 'Trắng' };
export const FrameHex = { oak: '#b0835c', black: '#242224', gold: '#b3a071', white: '#f4f2ed' };
export const OrderStates = {
  Pending: 'Đã nhận đơn', FileChecking: 'Kiểm tra & chỉnh màu', Printing: 'Đang in Lab',
  Finishing: 'Ép gỗ / Lắp khung', Shipped: 'Đang giao / Sẵn sàng lấy', Completed: 'Hoàn tất', Cancelled: 'Đã hủy',
};
export const TicketStates = { New: 'Mới tiếp nhận', InProgress: 'Đang xử lý', Resolved: 'Hoàn tất' };
export const Priorities = { normal: 'Thông thường', high: 'Ưu tiên', urgent: 'Khẩn cấp' };
export const Topics = [
  'Chỉnh sửa & retouch ảnh', 'Kiểm tra độ nét / DPI file', 'Tư vấn chọn cỡ & khung ảnh',
  'Đơn hàng in gấp', 'Bảo hành / Đổi trả', 'Hỗ trợ khác',
];
export const UsageTypes = { memories: 'Kỷ niệm & để ví', decor: 'Treo tường decor', gifts: 'Quà tặng', events: 'Sự kiện & quảng cáo' };
export const standardDimensions = {
  framed_photo: [30, 40], crystal_mirror: [40, 60], canvas_wrap: [40, 60],
  polaroid_card: [8, 10], photobook_open: [40, 24],
};

export function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function initialConfiguration(product, draft) {
  const size = product.printSizes.find(item => item.widthCm === draft?.widthCm && item.heightCm === draft?.heightCm) ?? product.printSizes[0];
  const [width, height] = standardDimensions[product.defaultModel3DType] || [10, 15];
  const custom = product.pricingMode === 'PerSqm' && draft && !product.printSizes.includes(
    product.printSizes.find(item => item.widthCm === draft.widthCm && item.heightCm === draft.heightCm),
  );
  return {
    productId: product.id, sizeLabel: custom ? '' : size?.label || '',
    widthCm: custom ? draft.widthCm : size?.widthCm || width,
    heightCm: custom ? draft.heightCm : size?.heightCm || height,
    surfaceName: product.paperOrSurfaceOptions[0]?.name || '',
    quantity: 1, finishingNames: [], turnaroundMode: 'Standard', sendAlbumLater: false,
    albumUrl: '', productOptions: { pageCount: 20, coverType: 'Bìa cứng' },
  };
}
