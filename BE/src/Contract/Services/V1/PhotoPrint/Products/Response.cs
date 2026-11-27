namespace OnePortal.Contract.Services.V1.PhotoPrint.Products;

public sealed record PhotoSizeDto(string Label, decimal WidthCm, decimal HeightCm, decimal? PriceDeltaOrBase);

public sealed record PhotoSurfaceDto(string Name, string? FinishType, decimal PricePerUnitOrSqm, string? Description, string? PricingUnit);

public sealed record PhotoFinishingDto(string Name, decimal Price, string Mode);

public sealed record PhotoDiscountTierDto(int MinQty, decimal DiscountPercent);

public sealed record PhotoCategoryInput(string Name, string Slug, string? Description, string? IconName, string? ImageUrl, int SortOrder = 0, bool IsActive = true);

public sealed record PhotoProductInput(Guid CategoryId, string Code, string Name, string Slug, string? ShortDescription, string? Description, string? ThumbnailUrl, string[]? Gallery,
    string PricingMode, decimal BasePrice, decimal MinBillableAreaSqm, bool SupportsBatchUpload, string? ProductionTimeLabel, int? ProductionHours,
    decimal RushSurchargePercent, PhotoSizeDto[]? PrintSizes, PhotoSurfaceDto[]? PaperOrSurfaceOptions, PhotoFinishingDto[]? FinishingOptions,
    PhotoDiscountTierDto[]? DiscountTiers, string[]? UsageTypes, string DefaultModel3DType, bool IsFeatured, bool IsActive = true, int MaxPhotosPerBatch = 50);

public sealed record PhotoCatalogFilter(string? Search, string? CategorySlug, string? Usage, string? Sort, bool Featured, int Page, int PageSize, bool IncludeInactive);
