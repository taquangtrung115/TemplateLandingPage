import Decimal from 'decimal.js';

function amount(value) {
  try {
    const result = new Decimal(value === '' || value == null ? 0 : value);
    return result.isFinite() ? Decimal.max(0, result) : new Decimal(0);
  } catch { return new Decimal(0); }
}
const currency = value => value.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
const precision = value => value.toDecimalPlaces(8).toNumber();

export function calculatePhotoPrintPrice({
  pricingMode, basePrice, sizePrice, surfacePrice, surfacePricingUnit = 'PerUnit', widthCm, heightCm,
  minBillableAreaSqm = 0, quantity, selectedFinishing = [], discountTiers = [], rushSurchargePercent = 0,
}) {
  const area = amount(widthCm).mul(amount(heightCm)).div(10000);
  const billable = Decimal.max(area, amount(minBillableAreaSqm));
  const count = amount(quantity).floor();
  const cost = (value, unit) => amount(value).mul(unit === 'PerSqm' ? billable : 1);
  const base = pricingMode === 'PerPrintSizeTier' ? amount(sizePrice ?? basePrice) : cost(basePrice, pricingMode);
  const surface = cost(surfacePrice, surfacePricingUnit);
  const finishing = selectedFinishing.reduce((total, item) => total.plus(cost(item.price, item.mode)), amount(0));
  const subtotal = base.plus(surface).plus(finishing);
  const rush = subtotal.mul(amount(rushSurchargePercent)).div(100);
  const tier = discountTiers.reduce((best, item) => (
    Number(item.minQty) > 0 && count.gte(item.minQty) && (!best || Number(item.minQty) > Number(best.minQty)) ? item : best
  ), null);
  const percent = Decimal.min(100, amount(tier?.discountPercent));
  const gross = subtotal.plus(rush);
  const discount = gross.mul(percent).div(100);
  const unit = gross.minus(discount);
  return {
    areaSqm: precision(area), billableAreaSqm: precision(billable), unitBaseCost: currency(base), surfaceCost: currency(surface),
    finishingCost: currency(finishing), rushFee: currency(rush), discountPercent: percent.toNumber(),
    discountAmount: currency(discount), discountTotal: currency(discount.mul(count)),
    unitFinalPrice: currency(unit), lineTotal: currency(unit.mul(count)),
  };
}

export function priceConfiguration(product, config) {
  const size = product.printSizes.find(item => item.label === config.sizeLabel);
  const surface = product.paperOrSurfaceOptions.find(item => item.name === config.surfaceName);
  return calculatePhotoPrintPrice({
    ...config, pricingMode: product.pricingMode, basePrice: product.basePrice,
    sizePrice: size?.priceDeltaOrBase, surfacePrice: surface?.pricePerUnitOrSqm,
    surfacePricingUnit: surface?.pricingUnit || (product.pricingMode === 'PerSqm' ? 'PerSqm' : 'PerUnit'),
    minBillableAreaSqm: product.minBillableAreaSqm,
    selectedFinishing: product.finishingOptions.filter(item => config.finishingNames.includes(item.name)),
    discountTiers: product.discountTiers,
    rushSurchargePercent: config.turnaroundMode === 'Rush' ? product.rushSurchargePercent : 0,
  });
}

export function orderItemPayload(item) {
  const { productId, sizeLabel, widthCm, heightCm, surfaceName, finishingNames, turnaroundMode,
    quantity, photoFiles, sendAlbumLater, albumUrl, productOptions } = item;
  return {
    productId, sizeLabel, widthCm, heightCm, surfaceName, finishingNames, turnaroundMode, quantity,
    photoFiles: photoFiles.map(({ id, thumbnailUrl, ...photo }) => photo), sendAlbumLater, albumUrl, productOptions,
  };
}

const moneyFormat = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
export const formatMoney = amount => moneyFormat.format(amount ?? 0);
export const billingUnit = mode => mode === 'PerSqm' ? 'm²' : 'tấm';
