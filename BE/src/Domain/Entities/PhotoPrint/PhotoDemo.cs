namespace OnePortal.Domain.Entities.PhotoPrint;

using OnePortal.Domain.Abstractions;

public sealed class PhotoDemo : AggregateRoot<Guid>
{
    public PhotoDemo() => Id = Guid.NewGuid();

    public Guid? LinkedProductId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? StyleCategory { get; set; }
    public string? Description { get; set; }
    public string? PreviewImageUrl { get; set; }
    public string? TextureImageUrl { get; set; }
    public string Model3DType { get; set; } = string.Empty;
    public decimal WidthCm { get; set; }
    public decimal HeightCm { get; set; }
    public string? FrameColor { get; set; }
    public bool HasMatboard { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
