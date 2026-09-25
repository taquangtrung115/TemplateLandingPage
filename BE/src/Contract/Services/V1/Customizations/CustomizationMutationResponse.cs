namespace TemplateLandingPage.Contract.Services.V1.Customizations;
public sealed record CustomizationMutationResponse(Guid Id, int Revision, Guid? VersionId = null, int? VersionNumber = null);
