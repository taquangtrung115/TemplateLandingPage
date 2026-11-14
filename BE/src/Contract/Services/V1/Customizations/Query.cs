namespace OnePortal.Contract.Services.V1.Customizations;

using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;

public record GetCustomizationByIdQuery(Guid Id, Guid? CurrentUserId = null, string? CurrentUserRole = null) : IQuery<CustomizationResponse>;
public record GetCustomizationBySlugQuery(string Slug, int? VersionNumber = null) : IQuery<PublicCustomizationResponse>;
public record GetMyCustomizationsQuery(Guid UserId, int Page = 1, int PageSize = 20) : IQuery<PagedResponse<CustomizationSummaryResponse>>;
