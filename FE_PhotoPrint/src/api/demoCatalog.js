const categoryRows = [
  ['anh-le', 'In ảnh lụa', 'Ảnh lụa 4R, in lẻ hoặc gói 10 tấm.', 'prints'],
  ['polaroid', 'Polaroid & Ép Plastic', 'Ảnh viền trắng, ép Plastic để giữ ảnh sạch và khô.', 'polaroid'],
  ['trang-guong', 'Ép gỗ & Tráng gương', 'Ảnh dày, phủ bóng và hoàn thiện cạnh.', 'crystal'],
  ['khung-canvas', 'Canvas & Khung ảnh', 'Ảnh treo tường hoặc để bàn.', 'frame'],
  ['photobook', 'Photobook & Album', 'Album mở phẳng cho ảnh cưới, gia đình và chuyến đi.', 'book'],
  ['anh-the', 'Ảnh thẻ & Visa', 'Ảnh 3×4, 4×6, visa và hộ chiếu. Có thể gửi file qua Zalo.', 'id'],
  ['photocopy', 'In màu & Photocopy', 'In màu laser, photocopy A4, scan PDF, đóng cuốn và ép dẻo.', 'prints'],
];
export const categories = categoryRows.map(([slug, name, description, image], index) => ({
  id: 'category-' + index, slug, name, description, imageUrl: '/assets/photo-' + image + '.webp', isActive: true,
}));

const sizes = (...items) => items.map(([widthCm, heightCm, priceDeltaOrBase]) => ({
  label: widthCm + ' × ' + heightCm + ' cm', widthCm, heightCm, priceDeltaOrBase,
}));
const productsRows = [
  [0, 'in-anh-10x15', 'In ảnh lụa 4R', 'framed_photo', 'PerPrintSizeTier', 3000, sizes([10, 15, 3000], [13, 18, 4300], [15, 21, 6500])],
  [0, 'in-anh-a4', 'In ảnh khổ lớn', 'framed_photo', 'PerPrintSizeTier', 18000, sizes([20, 30, 18000], [30, 45, 29000], [40, 60, 49000], [60, 90, 99000])],
  [1, 'anh-polaroid', 'Polaroid ép Plastic', 'polaroid_card', 'PerPrintSizeTier', 45000, sizes([8, 10, 45000], [6, 18, 50000], [10, 12, 55000])],
  [2, 'anh-trang-guong', 'Ảnh HD tráng gương', 'crystal_mirror', 'PerPrintSizeTier', 240000, sizes([40, 60, 240000], [30, 45, 185000], [60, 90, 410000])],
  [3, 'tranh-canvas', 'Tranh canvas căng khung', 'canvas_wrap', 'PerSqm', 580000, sizes([30, 45], [40, 60], [60, 90])],
  [3, 'khung-anh-go-soi', 'Khung ảnh gỗ sồi', 'framed_photo', 'PerPrintSizeTier', 139000, sizes([20, 30, 139000], [30, 40, 189000], [40, 60, 269000])],
  [4, 'photobook-mo-phang', 'Photobook mở phẳng', 'photobook_open', 'PerPrintSizeTier', 390000, sizes([40, 24, 390000], [48, 30, 520000])],
  [5, 'anh-the', 'Ảnh thẻ lấy liền', 'framed_photo', 'PerPrintSizeTier', 25000, sizes([3, 4, 25000], [4, 6, 25000], [5, 5, 30000])],
  [6, 'in-mau-photo-a4', 'In màu & Photocopy A4', 'framed_photo', 'PerPrintSizeTier', 20000, sizes([21, 29.7, 20000])],
];

const papers = [
  ['Giấy Fujifilm bóng', 0], ['Giấy lụa mờ', 800], ['Giấy metallic ánh kim', 1500],
];

export const products = productsRows.map(([categoryIndex, slug, name, model, pricingMode, basePrice, printSizes], index) => {
  const category = categories[categoryIndex];
  const fast = index <= 2 || index >= 7;
  const express = index >= 7;
  const surfaces = categoryIndex === 2 ? [['Pha lê 5 mm', 0], ['Ép gỗ laminate', 23000]]
    : categoryIndex === 3 && model === 'canvas_wrap' ? [['Vải canvas', 0], ['Canvas phủ bảo vệ', 35000]]
      : categoryIndex === 4 ? [['Giấy album lụa', 0], ['Giấy album metallic', 55000]]
        : slug === 'in-anh-10x15' ? [['Giấy ảnh lụa Fujicolor', 0]]
          : slug === 'anh-polaroid' ? [['Giấy ảnh ép Plastic', 0]]
            : categoryIndex === 6 ? [['Giấy in laser A4', 0]] : papers;
  return {
    id: 'photo-product-' + index, code: 'PHOTO-' + (index + 1),
    categoryId: category.id, categoryName: category.name, categorySlug: category.slug,
    slug, name, pricingMode, basePrice, printSizes,
    shortDescription: category.description, description: 'Kiểm tra cỡ, bề mặt và vùng cắt trên từng ảnh trước khi gửi in.',
    thumbnailUrl: category.imageUrl, gallery: [category.imageUrl, '/assets/photo-hero.webp'],
    supportsBatchUpload: true, maxPhotosPerBatch: 50, productionTimeLabel: express ? 'Lấy liền 15p' : fast ? 'Trong ngày' : 'Đặt trước 1–2 ngày',
    productionHours: express ? 1 : fast ? 12 : 36, rushSurchargePercent: fast ? 25 : 0,
    defaultModel3DType: model, minBillableAreaSqm: 0.2,
    usageTypes: categoryIndex < 2 ? ['memories', 'gifts'] : categoryIndex < 5 ? ['decor', 'gifts'] : ['events'],
    paperOrSurfaceOptions: surfaces.map(([name, pricePerUnitOrSqm]) => ({
      name, finishType: model, pricePerUnitOrSqm, pricingUnit: pricingMode === 'PerSqm' ? 'PerSqm' : 'PerUnit',
    })),
    finishingOptions: categoryIndex === 6 ? [
      { name: 'Scan PDF', price: 3000, mode: 'PerUnit' }, { name: 'Đóng cuốn lò xo', price: 15000, mode: 'PerUnit' }, { name: 'Ép dẻo', price: 10000, mode: 'PerUnit' },
    ] : fast ? [{ name: 'Bo tròn bốn góc', price: 500, mode: 'PerUnit' }]
      : [{ name: 'Hộp quà tặng', price: 30000, mode: 'PerUnit' }],
    discountTiers: fast ? [{ minQty: 20, discountPercent: 10 }, { minQty: 50, discountPercent: 15 }] : [],
    isFeatured: [0, 2, 7, 8].includes(index), isActive: true,
  };
});

export const demos = [5, 3, 4, 2, 6].map((index, at) => {
  const product = products[index];
  return {
    id: 'demo-' + at, title: ['Khung gỗ sồi cho góc nhà', 'Kỷ niệm dưới lớp pha lê', 'Canvas treo tường', 'Một chuyến đi trên Polaroid', 'Album ảnh mở phẳng'][at],
    styleCategory: product.defaultModel3DType, model3DType: product.defaultModel3DType,
    linkedProductId: product.id, linkedProductSlug: product.slug, description: product.paperOrSurfaceOptions[0].name,
    widthCm: product.printSizes[0].widthCm, heightCm: product.printSizes[0].heightCm,
    previewImageUrl: product.thumbnailUrl, textureImageUrl: '/assets/photo-texture.webp',
    isActive: true, frameColor: 'oak', hasMatboard: at === 0,
  };
});
