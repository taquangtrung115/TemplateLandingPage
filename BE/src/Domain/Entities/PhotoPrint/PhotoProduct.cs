namespace OnePortal.Domain.Entities.PhotoPrint;

using OnePortal.Domain.Abstractions;

public sealed class PhotoProduct : AggregateRoot<Guid>
{
    public PhotoProduct() => Id = Guid.NewGuid();

    public Guid CategoryId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string GalleryJson { get; set; } = "[]";
    public string PricingMode { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public decimal MinBillableAreaSqm { get; set; }
    public bool SupportsBatchUpload { get; set; }
    public int MaxPhotosPerBatch { get; set; }
    public string? ProductionTimeLabel { get; set; }
    public int? ProductionHours { get; set; }
    public decimal RushSurchargePercent { get; set; }
    public string PrintSizesJson { get; set; } = "[]";
    public string PaperOrSurfaceOptionsJson { get; set; } = "[]";
    public string FinishingOptionsJson { get; set; } = "[]";
    public string DiscountTiersJson { get; set; } = "[]";
    public string UsageTypesJson { get; set; } = "[]";
    public string DefaultModel3DType { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime ModifiedAtUtc { get; set; }
}
