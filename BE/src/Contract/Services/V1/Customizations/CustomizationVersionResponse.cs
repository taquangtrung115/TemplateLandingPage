namespace TemplateLandingPage.Contract.Services.V1.Customizations;
public sealed record CustomizationVersionResponse(Guid Id, Guid CustomizationId, int VersionNumber,
    string Title, bool IsPublic, DateTime CreatedAtUtc, DateTime? PublishedAtUtc, string PublicUrl, string? ConfigJson = null,
    bool IsMain = false);
