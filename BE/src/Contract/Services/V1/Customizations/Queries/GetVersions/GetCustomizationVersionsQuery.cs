namespace OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
public sealed record GetCustomizationVersionsQuery(Guid Id, Guid CurrentUserId, string CurrentUserRole,
    int Page = 1, int PageSize = 20) : IQuery<PagedResponse<CustomizationVersionResponse>>;
