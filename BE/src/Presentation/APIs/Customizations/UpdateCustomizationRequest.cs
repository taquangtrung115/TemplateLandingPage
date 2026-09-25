namespace TemplateLandingPage.Presentation.APIs.Customizations;
public sealed record UpdateCustomizationRequest(string Title, string Slug, string ConfigJson, int ExpectedRevision, Guid RequestId);
