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
export const printServicePresets = [
  { slug: 'anh-the', category: 'anh-the', title: 'In ảnh thẻ 15p', short: 'Ảnh thẻ', spec: '3×4 · 4×6 · Visa', label: 'Ảnh thẻ 15p', badge: 'Lấy liền 15p', tone: 'mint', color: '#94bdb4',
    image: '/assets/photo-id.webp', details: ['3 × 4 cm · 4 × 6 cm', 'Ảnh visa và hộ chiếu', 'Cắt sẵn · Gửi file qua Zalo'] },
  { slug: 'in-anh-10x15', category: 'anh-le', title: 'In ảnh lụa 4R', short: 'Ảnh lụa 4R', spec: '10×15 cm', label: 'Ảnh lụa 4R', badge: 'Bán chạy nhất', tone: 'rose', color: '#d396a7',
    image: '/assets/photo-prints.webp', details: ['10 × 15 cm · Khổ 4R', 'Giấy ảnh lụa', 'In lẻ hoặc 10 tấm'] },
  { slug: 'anh-polaroid', category: 'polaroid', title: 'Polaroid kỷ niệm', short: 'Polaroid', spec: 'Ảnh viền trắng', label: 'Polaroid & Plastic', badge: 'Ép Plastic', tone: 'lilac', color: '#ab9ac4',
    image: '/assets/photo-polaroid.webp', details: ['Ảnh viền trắng', 'Thêm lời nhắn dưới ảnh', 'Ép Plastic theo mẫu'] },
  { slug: 'in-mau-photo-a4', category: 'photocopy', title: 'In màu & Photo A4', short: 'Photo A4', spec: 'Scan PDF · Đóng cuốn', label: 'In màu & Photo A4', badge: 'Photocopy', tone: 'gold', color: '#d1ad6c',
    image: '/assets/photo-book.webp', details: ['A4 · In màu laser', 'Scan PDF và gửi file', 'Đóng cuốn · Ép dẻo'] },
  { slug: 'khung-anh-go-soi', category: 'khung-canvas', title: 'Khung & pha lê', short: 'Khung ảnh', spec: 'Gỗ sồi · Tráng gương', label: 'Khung & đặt trước', badge: 'Đặt trước', tone: 'oak', color: '#b79474',
    image: '/assets/photo-frame.webp', details: ['Khung gỗ sồi · Ảnh tráng gương', 'Chọn kích thước và bề mặt', 'Hẹn lịch nhận tại tiệm'] },
];
