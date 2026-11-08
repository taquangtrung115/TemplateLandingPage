namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Helpers;

using TemplateLandingPage.Contract.Services.V1.Quoting.Quotations;

internal static class QuotationAmountValidation
{
    #region Financial storage bounds
    private const decimal MaximumAmount = 9999999999999999.99m;

    public static bool CanStore(IEnumerable<QuotationItemDto>? items, decimal discountPercent, decimal taxPercent)
    {
        if (items is null || discountPercent is < 0 or > 100 || taxPercent is < 0 or > 100) return true;
        decimal subtotal = 0;
        foreach (var item in items)
        {
            if (item is null || item.Quantity <= 0 || item.UnitPrice < 0 || item.DiscountPercent is < 0 or > 100) continue;
            if (item.UnitPrice > 0 && item.Quantity > MaximumAmount / item.UnitPrice) return false;
            var gross = decimal.Round(item.Quantity * item.UnitPrice, 2, MidpointRounding.AwayFromZero);
            var lineDiscount = decimal.Round(gross * item.DiscountPercent / 100, 2, MidpointRounding.AwayFromZero);
            var lineTotal = gross - lineDiscount;
            if (subtotal > MaximumAmount - lineTotal) return false;
            subtotal += lineTotal;
        }
        var discount = decimal.Round(subtotal * discountPercent / 100, 2, MidpointRounding.AwayFromZero);
        var taxable = subtotal - discount;
        var tax = decimal.Round(taxable * taxPercent / 100, 2, MidpointRounding.AwayFromZero);
        return taxable + tax <= MaximumAmount;
    }
    #endregion
}
