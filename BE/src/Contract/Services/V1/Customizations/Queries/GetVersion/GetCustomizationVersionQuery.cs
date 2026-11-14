namespace OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Contract.Abstractions.Message;
public sealed record GetCustomizationVersionQuery(Guid Id, Guid VersionId, Guid CurrentUserId,
    string CurrentUserRole) : IQuery<CustomizationVersionResponse>;
