namespace OnePortal.Application.UseCases.V1.PhotoPrint.Helpers;

using OnePortal.Contract.Services.V1.PhotoPrint.Products;
using OnePortal.Contract.Services.V1.PhotoPrint.Orders;

public static class PhotoPricingCalculator
{
    public static PhotoPricingResult Calculate(string mode, decimal basePrice, decimal? sizePrice, PhotoSurfaceDto? surface,
        decimal width, decimal height, decimal minimumArea, int quantity, IEnumerable<PhotoFinishingDto> finishing,
        IEnumerable<PhotoDiscountTierDto> discounts, decimal rushPercent)
    {
        var billableArea = Math.Max(minimumArea, width * height / 10_000);
        decimal Cost(decimal price, string unit) => unit == "PerSqm" ? price * billableArea : price;
        var baseCost = mode == "PerPrintSizeTier" ? sizePrice ?? basePrice : Cost(basePrice, mode);
        var surfaceCost = surface is null ? 0 : Cost(surface.PricePerUnitOrSqm, surface.PricingUnit ?? (mode == "PerSqm" ? "PerSqm" : "PerUnit"));
        var subtotal = baseCost + surfaceCost + finishing.Sum(option => Cost(option.Price, option.Mode));
        var gross = subtotal * (1 + rushPercent / 100);
        var tier = discounts.Where(item => item.MinQty <= quantity).MaxBy(item => item.MinQty);
        var discount = gross * (tier?.DiscountPercent ?? 0) / 100;
        var unit = gross - discount;
        return new(Round(unit), Round(unit * quantity), Round(discount * quantity));
    }

    public static int EvaluateDpi(int widthPx, int heightPx, decimal widthCm, decimal heightCm)
    {
        if (widthPx <= 0 || heightPx <= 0 || widthCm <= 0 || heightCm <= 0) return 0;
        if (widthPx != heightPx && widthCm != heightCm && (widthPx > heightPx) != (widthCm > heightCm))
            (widthCm, heightCm) = (heightCm, widthCm);
        return (int)Math.Floor(2.54m * Math.Min(widthPx / widthCm, heightPx / heightCm));
    }

    private static decimal Round(decimal value) => Math.Round(value, 0, MidpointRounding.AwayFromZero);
}
