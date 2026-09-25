namespace TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Contract.Abstractions.Message;
using TemplateLandingPage.Contract.Abstractions.Shared;
public sealed record SearchAdminCustomizationsQuery(Guid CurrentUserId, string CurrentUserRole,
    bool Ownerless = true, int Page = 1, int PageSize = 20) : IQuery<PagedResponse<CustomizationSummaryResponse>>;
