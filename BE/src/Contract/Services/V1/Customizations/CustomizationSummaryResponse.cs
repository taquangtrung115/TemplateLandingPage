namespace OnePortal.Contract.Services.V1.Customizations;
public sealed record CustomizationSummaryResponse(Guid Id, Guid? UserId, Guid TemplateId, string TemplateName,
    string Title, string Slug, int Revision, int LastVersionNumber, Guid? PublishedVersionId, DateTime CreatedAtUtc)
{
    [System.Text.Json.Serialization.JsonIgnore]
    public string? TenantKey { get; init; }
    public bool IsPublished => PublishedVersionId.HasValue;
    public string? PublicUrl => IsPublished ? $"{(string.IsNullOrEmpty(TenantKey) || TenantKey == "landing-default" ? "" : "/t/" + Uri.EscapeDataString(TenantKey))}/p/{Uri.EscapeDataString(Slug)}" : null;
}
