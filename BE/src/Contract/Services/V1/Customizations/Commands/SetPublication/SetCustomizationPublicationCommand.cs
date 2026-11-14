namespace OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Contract.Abstractions.Message;
public sealed record SetCustomizationPublicationCommand(Guid Id, Guid VersionId, int ExpectedRevision,
    Guid CurrentUserId, string CurrentUserRole) : ICommand<CustomizationMutationResponse>;
