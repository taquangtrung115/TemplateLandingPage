namespace OnePortal.Contract.Services.V1.Customizations;

using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;

public record GetCustomizationByIdQuery(Guid Id, Guid? CurrentUserId = null, string? CurrentUserRole = null) : IQuery<CustomizationResponse>;
public record GetCustomizationBySlugQuery(string Slug, int? VersionNumber = null) : IQuery<PublicCustomizationResponse>;
public record GetMyCustomizationsQuery(Guid UserId, int Page = 1, int PageSize = 20) : IQuery<PagedResponse<CustomizationSummaryResponse>>;

public sealed record GetCustomizationVersionQuery(Guid Id, Guid VersionId, Guid CurrentUserId,
    string CurrentUserRole) : IQuery<CustomizationVersionResponse>;

public sealed record GetCustomizationVersionsQuery(Guid Id, Guid CurrentUserId, string CurrentUserRole,
    int Page = 1, int PageSize = 20) : IQuery<PagedResponse<CustomizationVersionResponse>>;

public sealed record SearchAdminCustomizationsQuery(Guid CurrentUserId, string CurrentUserRole,
    bool Ownerless = true, int Page = 1, int PageSize = 20) : IQuery<PagedResponse<CustomizationSummaryResponse>>;
