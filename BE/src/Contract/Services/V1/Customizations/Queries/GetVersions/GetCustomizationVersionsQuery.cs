namespace TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Contract.Abstractions.Message;
using TemplateLandingPage.Contract.Abstractions.Shared;
public sealed record GetCustomizationVersionsQuery(Guid Id, Guid CurrentUserId, string CurrentUserRole,
    int Page = 1, int PageSize = 20) : IQuery<PagedResponse<CustomizationVersionResponse>>;
