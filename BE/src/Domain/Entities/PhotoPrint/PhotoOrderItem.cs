namespace OnePortal.Domain.Entities.PhotoPrint;

using OnePortal.Domain.Abstractions;

public sealed class PhotoOrderItem : TenantEntity<Guid>
{
    public PhotoOrderItem() => Id = Guid.NewGuid();

    public Guid OrderId { get; set; }
    public Guid? ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? SizeLabel { get; set; }
    public decimal WidthCm { get; set; }
    public decimal HeightCm { get; set; }
    public string? SurfaceName { get; set; }
    public string? FinishingSummary { get; set; }
    public string TurnaroundMode { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
    public string PhotoFilesJson { get; set; } = "[]";
    public bool SendAlbumLater { get; set; }
    public string? AlbumUrl { get; set; }
    public string? ProductOptionsJson { get; set; }
}
