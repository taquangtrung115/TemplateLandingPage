namespace TemplateLandingPage.Contract.Services.V1.Customizations;

using TemplateLandingPage.Contract.Abstractions.Shared;

public record CustomizationResponse(
    Guid Id,
    Guid? UserId,
    Guid TemplateId,
    string TemplateName,
    string Title,
    string Slug,
    string ConfigJson,
    bool IsPublished,
    DateTime CreatedAtUtc);

public static class CustomizationErrors
{
    public static readonly Error NotFound = new("Customization.NotFound", "Không tìm thấy bản tùy biến.");
    public static readonly Error DuplicateSlug = new("Customization.DuplicateSlug", "Đường dẫn (slug) này đã được sử dụng.");
    public static readonly Error Unauthorized = new("Customization.Unauthorized", "Bạn không có quyền chỉnh sửa bản tùy biến này.");
}
