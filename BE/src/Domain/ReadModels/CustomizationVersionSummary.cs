namespace TemplateLandingPage.Domain.ReadModels;

public sealed record CustomizationVersionSummary(Guid Id, Guid CustomizationId, int VersionNumber,
    string Title, bool IsPublic, DateTime CreatedAtUtc, DateTime? PublishedAtUtc);
