namespace OnePortal.Contract.Services.V1.Interactions;

using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;

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
