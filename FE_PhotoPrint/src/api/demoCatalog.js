const categoryRows = [
  ['anh-le', 'In ảnh lẻ', 'Ảnh 4R, 5R, 6R, A4 và khổ lớn.', 'prints'],
  ['polaroid', 'Polaroid & Photostrip', 'Ảnh viền trắng, thêm lời nhắn dưới từng tấm.', 'polaroid'],
  ['trang-guong', 'Ép gỗ & Tráng gương', 'Ảnh dày, phủ bóng và hoàn thiện cạnh.', 'crystal'],
  ['khung-canvas', 'Canvas & Khung ảnh', 'Ảnh treo tường hoặc để bàn.', 'frame'],
  ['photobook', 'Photobook & Album', 'Album mở phẳng cho ảnh cưới, gia đình và chuyến đi.', 'book'],
  ['anh-the', 'Ảnh thẻ & Ấn phẩm', 'Ảnh thẻ, ảnh visa và các ấn phẩm hình ảnh.', 'id'],
];
export const categories = categoryRows.map(([slug, name, description, image], index) => ({
  id: 'category-' + index, slug, name, description, imageUrl: '/assets/photo-' + image + '.webp', isActive: true,
}));

const sizes = (...items) => items.map(([widthCm, heightCm, priceDeltaOrBase]) => ({
  label: widthCm + ' × ' + heightCm + ' cm', widthCm, heightCm, priceDeltaOrBase,
}));
const productsRows = [
  [0, 'in-anh-10x15', 'In ảnh lẻ 4R', 'framed_photo', 'PerPrintSizeTier', 2500, sizes([6, 9, 1800], [9, 12, 2200], [10, 15, 2500], [13, 18, 4300], [15, 21, 6500])],
  [0, 'in-anh-a4', 'In ảnh khổ lớn', 'framed_photo', 'PerPrintSizeTier', 18000, sizes([20, 30, 18000], [30, 45, 29000], [40, 60, 49000], [60, 90, 99000])],
  [1, 'anh-polaroid', 'Ảnh Polaroid viền trắng', 'polaroid_card', 'PerPrintSizeTier', 4500, sizes([8, 10, 4500], [6, 18, 7000], [10, 12, 7500])],
  [2, 'anh-trang-guong', 'Ảnh HD tráng gương', 'crystal_mirror', 'PerPrintSizeTier', 240000, sizes([40, 60, 240000], [30, 45, 185000], [60, 90, 410000])],
  [3, 'tranh-canvas', 'Tranh canvas căng khung', 'canvas_wrap', 'PerSqm', 580000, sizes([30, 45], [40, 60], [60, 90])],
  [3, 'khung-anh-go-soi', 'Khung ảnh gỗ sồi', 'framed_photo', 'PerPrintSizeTier', 139000, sizes([20, 30, 139000], [30, 40, 189000], [40, 60, 269000])],
  [4, 'photobook-mo-phang', 'Photobook mở phẳng', 'photobook_open', 'PerPrintSizeTier', 390000, sizes([40, 24, 390000], [48, 30, 520000])],
  [5, 'anh-the', 'Ảnh thẻ lấy liền', 'framed_photo', 'PerPrintSizeTier', 6000, sizes([2, 3, 6000], [3, 4, 7000], [4, 6, 9000], [5, 5, 9000])],
];

const papers = [
  ['Giấy Fujifilm bóng', 0], ['Giấy lụa mờ', 800], ['Giấy metallic ánh kim', 1500],
];

export const products = productsRows.map(([categoryIndex, slug, name, model, pricingMode, basePrice, printSizes], index) => {
  const category = categories[categoryIndex];
  const surfaces = categoryIndex === 2 ? [['Pha lê 5 mm', 0], ['Ép gỗ laminate', 23000]]
    : categoryIndex === 3 && model === 'canvas_wrap' ? [['Vải canvas', 0], ['Canvas phủ bảo vệ', 35000]]
      : categoryIndex === 4 ? [['Giấy album lụa', 0], ['Giấy album metallic', 55000]] : papers;
  return {
    id: 'photo-product-' + index, code: 'PHOTO-' + (index + 1),
    categoryId: category.id, categoryName: category.name, categorySlug: category.slug,
    slug, name, pricingMode, basePrice, printSizes,
    shortDescription: category.description, description: 'Kiểm tra cỡ, bề mặt và vùng cắt trên từng ảnh trước khi gửi in.',
    thumbnailUrl: category.imageUrl, gallery: [category.imageUrl, '/assets/photo-hero.webp'],
    supportsBatchUpload: true, maxPhotosPerBatch: 50, productionTimeLabel: index === 7 ? '2–4 giờ' : index < 3 ? 'Trong ngày' : '1–2 ngày',
    productionHours: index === 7 ? 4 : index < 3 ? 12 : 36, rushSurchargePercent: index < 3 ? 25 : 0,
    defaultModel3DType: model, minBillableAreaSqm: 0.2,
    usageTypes: categoryIndex < 2 ? ['memories', 'gifts'] : categoryIndex < 5 ? ['decor', 'gifts'] : ['events'],
    paperOrSurfaceOptions: surfaces.map(([name, pricePerUnitOrSqm]) => ({
      name, finishType: model, pricePerUnitOrSqm, pricingUnit: pricingMode === 'PerSqm' ? 'PerSqm' : 'PerUnit',
    })),
    finishingOptions: categoryIndex < 2 ? [{ name: 'Bo tròn bốn góc', price: 500, mode: 'PerUnit' }]
      : [{ name: 'Hộp quà tặng', price: 30000, mode: 'PerUnit' }],
    discountTiers: index < 3 ? [{ minQty: 20, discountPercent: 10 }, { minQty: 50, discountPercent: 15 }] : [],
    isFeatured: true, isActive: true,
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
