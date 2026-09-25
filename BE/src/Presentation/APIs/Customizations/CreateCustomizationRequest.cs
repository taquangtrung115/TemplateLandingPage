namespace TemplateLandingPage.Presentation.APIs.Customizations;
public sealed record CreateCustomizationRequest(Guid TemplateId, string Title, string Slug, string ConfigJson, Guid ClientDraftId);
