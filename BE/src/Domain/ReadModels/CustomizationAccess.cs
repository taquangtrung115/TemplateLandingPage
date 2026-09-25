namespace TemplateLandingPage.Domain.ReadModels;

public sealed record CustomizationAccess(Guid Id, Guid? UserId, string Slug, Guid? PublishedVersionId);
