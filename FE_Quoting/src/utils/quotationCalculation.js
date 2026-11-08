import Decimal from 'decimal.js';

// #region Financial calculations
const money = (value) => new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

export function calculateQuotation(items, discountPercent, taxPercent) {
  const subTotal = items.reduce((total, item) => {
    const gross = money(new Decimal(item.quantity || 0).times(item.unitPrice || 0));
    const discount = money(gross.times(item.discountPercent || 0).dividedBy(100));
    return total.plus(gross.minus(discount));
  }, new Decimal(0));
  const discountAmount = money(subTotal.times(discountPercent || 0).dividedBy(100));
  const taxable = subTotal.minus(discountAmount);
  const taxAmount = money(taxable.times(taxPercent || 0).dividedBy(100));
  return {
    subTotal: subTotal.toNumber(),
    discountAmount: discountAmount.toNumber(),
    taxAmount: taxAmount.toNumber(),
    totalAmount: taxable.plus(taxAmount).toNumber(),
  };
}
// #endregion
