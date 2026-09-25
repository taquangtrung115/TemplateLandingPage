namespace TemplateLandingPage.Contract.Services.V1.Interactions;

using TemplateLandingPage.Contract.Abstractions.Message;
using TemplateLandingPage.Contract.Abstractions.Shared;

public record GetRsvpsByCustomizationIdQuery(
    Guid CustomizationId,
    Guid? VersionId,
    int Page,
    int PageSize,
    Guid? CurrentUserId,
    bool IsAdmin) : IQuery<PagedResponse<RsvpResponse>>;

public record GetGuestbookByCustomizationIdQuery(
    Guid CustomizationId,
    Guid? VersionId,
    int Page,
    int PageSize,
    Guid? CurrentUserId,
    bool IsAdmin) : IQuery<PagedResponse<GuestbookResponse>>;
