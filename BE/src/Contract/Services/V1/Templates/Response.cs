namespace TemplateLandingPage.Contract.Services.V1.Templates;

using TemplateLandingPage.Contract.Abstractions.Shared;

public record TemplateResponse(
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
    string DefaultConfigJson,
    bool IsActive,
    bool IsCommunity,
    string? AuthorName,
    DateTime CreatedAtUtc);

public static class TemplateErrors
{
    public static readonly Error NotFound = new("Template.NotFound", "Không tìm thấy template.");
    public static readonly Error DuplicateSlug = new("Template.DuplicateSlug", "Slug đã tồn tại, vui lòng chọn slug khác.");
    public static readonly Error InvalidConfigJson = new("Template.InvalidConfigJson", "Cấu hình JSON không hợp lệ.");
}
