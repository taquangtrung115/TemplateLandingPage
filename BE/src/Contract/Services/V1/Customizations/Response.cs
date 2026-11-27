namespace OnePortal.Contract.Services.V1.Customizations;

using OnePortal.Contract.Abstractions.Shared;

public record CustomizationResponse(Guid Id, Guid? UserId, Guid TemplateId, string TemplateName,
    string Title, string Slug, string ConfigJson, bool IsPublished, DateTime CreatedAtUtc,
    int Revision = 1, int LastVersionNumber = 0, Guid? PublishedVersionId = null, Guid? ClientDraftId = null);

public static class CustomizationErrors
{
    public static readonly Error NotFound = new("Customization.NotFound", "Không tìm thấy trang hoặc phiên bản.");
    public static readonly Error DuplicateSlug = new("Customization.DuplicateSlug", "Đường dẫn này đã được sử dụng, bao gồm đường dẫn cũ.");
    public static readonly Error Unauthorized = new("Customization.Unauthorized", "Bạn không có quyền truy cập trang này.");
    public static readonly Error Conflict = new("Customization.Conflict", "Dữ liệu đã thay đổi. Bản nháp của bạn vẫn được giữ; hãy tải lại hoặc tạo bản sao.");
    public static readonly Error InvalidRequest = new("Customization.InvalidRequest", "Yêu cầu không hợp lệ. Hãy tải lại trang và thử lại.");
}

public sealed record CustomizationMutationResponse(Guid Id, int Revision, Guid? VersionId = null, int? VersionNumber = null);

public sealed record CustomizationSummaryResponse(Guid Id, Guid? UserId, Guid TemplateId, string TemplateName,
    string Title, string Slug, int Revision, int LastVersionNumber, Guid? PublishedVersionId, DateTime CreatedAtUtc)
{
    [System.Text.Json.Serialization.JsonIgnore]
    public string? TenantKey { get; init; }
    public bool IsPublished => PublishedVersionId.HasValue;
    public string? PublicUrl => IsPublished ? $"{(string.IsNullOrEmpty(TenantKey) || TenantKey == "landing-default" ? "" : "/t/" + Uri.EscapeDataString(TenantKey))}/p/{Uri.EscapeDataString(Slug)}" : null;
}

public sealed record CustomizationVersionResponse(Guid Id, Guid CustomizationId, int VersionNumber,
    string Title, bool IsPublic, DateTime CreatedAtUtc, DateTime? PublishedAtUtc, string PublicUrl, string? ConfigJson = null,
    bool IsMain = false);

public sealed record PublicCustomizationResponse(Guid Id, Guid VersionId, int VersionNumber, Guid TemplateId,
    string Title, string Slug, string ConfigJson, string PublicUrl);
