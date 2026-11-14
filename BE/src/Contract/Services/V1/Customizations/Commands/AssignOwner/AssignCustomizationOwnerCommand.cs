namespace OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Contract.Abstractions.Message;
public sealed record AssignCustomizationOwnerCommand(Guid Id, Guid UserId, int ExpectedRevision,
    Guid CurrentUserId, string CurrentUserRole) : ICommand<CustomizationMutationResponse>;
