namespace OnePortal.Contract.Services.V1.PhotoPrint.Orders;

public sealed record PhotoFileDto(string FileUrl, string OriginalFileName, int WidthPx, int HeightPx, int ComputedDpi, string FitMode, decimal FocalX, decimal FocalY,
    string? Caption, int PrintQty, string? Note, string? CaptionFont, string? BorderTone);

public sealed record PhotoProductOptionsDto(int PageCount, string CoverType);

public sealed record PhotoOrderItemInput(Guid ProductId, string? SizeLabel, decimal WidthCm, decimal HeightCm, string? SurfaceName, string[]? FinishingNames, string TurnaroundMode,
    int Quantity, PhotoFileDto[]? PhotoFiles, bool SendAlbumLater, string? AlbumUrl, PhotoProductOptionsDto? ProductOptions, Guid? ComboGroupId = null);

public sealed record PhotoOrderInput(string CustomerName, string CustomerPhone, string? CustomerEmail, string? DeliveryAddress, string DeliveryMethod,
    string PaymentMethod, string? Notes, PhotoOrderItemInput[] Items);

public sealed record PhotoPricingResult(decimal UnitPrice, decimal LineTotal, decimal DiscountTotal);
