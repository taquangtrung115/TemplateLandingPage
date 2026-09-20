namespace TemplateLandingPage.Contract.Services.V1.Categories;

using TemplateLandingPage.Contract.Abstractions.Shared;

public record CategoryResponse(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? Icon,
    int OrderIndex,
    bool IsActive,
    int TemplateCount,
    DateTime CreatedAtUtc);

public static class CategoryErrors
{
    public static readonly Error NotFound = new("Category.NotFound", "Không tìm thấy danh mục.");
    public static readonly Error DuplicateSlug = new("Category.DuplicateSlug", "Slug danh mục đã tồn tại.");
    public static readonly Error HasAssociatedTemplates = new("Category.HasAssociatedTemplates", "Không thể xóa danh mục đang có mẫu thiệp liên kết.");
}
