namespace OnePortal.Contract.Services.V1.PhotoPrint.Demos;

public sealed record PhotoDemoInput(Guid? LinkedProductId, string Title, string? StyleCategory, string? Description, string? PreviewImageUrl, string? TextureImageUrl,
    string Model3DType, decimal WidthCm, decimal HeightCm, string? FrameColor, bool HasMatboard, bool IsFeatured, bool IsActive = true);
