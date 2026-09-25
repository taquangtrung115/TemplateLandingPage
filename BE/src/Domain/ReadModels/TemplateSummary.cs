namespace TemplateLandingPage.Domain.ReadModels;

public sealed record TemplateSummary(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    Guid? CategoryId,
    string Category,
    string ThumbnailUrl,
    string? PreviewUrl,
    string? LongPreviewUrl,
    string? Badge,
    string? AudioUrl,
    string? MusicTitle,
    bool IsActive,
    bool IsCommunity,
    string? AuthorName,
    DateTime CreatedAtUtc);
