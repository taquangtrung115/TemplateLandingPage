namespace TemplateLandingPage.Domain.ReadModels;

public sealed record CustomizationSummary(Guid Id, Guid? UserId, Guid TemplateId, string TemplateName,
    string Title, string Slug, int Revision, int LastVersionNumber, Guid? PublishedVersionId, DateTime CreatedAtUtc);
