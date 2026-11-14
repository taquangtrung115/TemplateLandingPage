namespace OnePortal.Contract.Services.V1.Customizations;
public sealed record PublicCustomizationResponse(Guid Id, Guid VersionId, int VersionNumber, Guid TemplateId,
    string Title, string Slug, string ConfigJson, string PublicUrl);
