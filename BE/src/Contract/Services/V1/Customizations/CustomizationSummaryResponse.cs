namespace TemplateLandingPage.Contract.Services.V1.Customizations;
public sealed record CustomizationSummaryResponse(Guid Id, Guid? UserId, Guid TemplateId, string TemplateName,
    string Title, string Slug, int Revision, int LastVersionNumber, Guid? PublishedVersionId, DateTime CreatedAtUtc)
{
    public bool IsPublished => PublishedVersionId.HasValue;
    public string? PublicUrl => IsPublished ? $"/p/{Uri.EscapeDataString(Slug)}" : null;
}
