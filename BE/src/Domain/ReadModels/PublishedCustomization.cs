namespace TemplateLandingPage.Domain.ReadModels;

public sealed record PublishedCustomization(Guid Id, Guid VersionId, int VersionNumber, Guid TemplateId,
    string Title, string Slug, string ConfigJson);
