namespace TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Contract.Abstractions.Message;
public sealed record RemoveCustomizationPublicationCommand(Guid Id, Guid? VersionId, int ExpectedRevision,
    Guid CurrentUserId, string CurrentUserRole) : ICommand<CustomizationMutationResponse>;
