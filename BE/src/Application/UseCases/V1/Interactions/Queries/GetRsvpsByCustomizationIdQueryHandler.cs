namespace OnePortal.Application.UseCases.V1.Interactions.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Interactions;
using OnePortal.Domain.Repositories;

public sealed class GetRsvpsByCustomizationIdQueryHandler : IQueryHandler<GetRsvpsByCustomizationIdQuery, PagedResponse<RsvpResponse>>
{
    private readonly IRsvpRepository _rsvpRepository;
    private readonly ICustomizationRepository _customizationRepository;

    public GetRsvpsByCustomizationIdQueryHandler(IRsvpRepository rsvpRepository, ICustomizationRepository customizationRepository)
    {
        _rsvpRepository = rsvpRepository;
        _customizationRepository = customizationRepository;
    }

    public async Task<Result<PagedResponse<RsvpResponse>>> Handle(GetRsvpsByCustomizationIdQuery request, CancellationToken cancellationToken)
    {
        if (!request.VersionId.HasValue || request.VersionId.Value == Guid.Empty)
        {
            return Result.Failure<PagedResponse<RsvpResponse>>(InteractionErrors.VersionRequired);
        }

        var customization = await _customizationRepository.ReadAccessAsync(request.CustomizationId, cancellationToken);
        if (customization is null)
        {
            return Result.Failure<PagedResponse<RsvpResponse>>(InteractionErrors.NotFound);
        }

        if (!request.IsAdmin && (!request.CurrentUserId.HasValue || customization.UserId != request.CurrentUserId.Value))
        {
            return Result.Failure<PagedResponse<RsvpResponse>>(InteractionErrors.AccessDenied);
        }

        var version = await _customizationRepository.ReadVersionAsync(
            request.CustomizationId,
            request.VersionId.Value,
            cancellationToken);
        if (version is null)
        {
            return Result.Failure<PagedResponse<RsvpResponse>>(InteractionErrors.NotFound);
        }

        var page = Math.Clamp(request.Page, 1, 1_000_000);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var (entries, total) = await _rsvpRepository.GetPageByCustomizationVersionIdAsync(
            version.Id,
            page,
            pageSize,
            cancellationToken);
        var response = entries.Select(e => new RsvpResponse(
            e.Id,
            e.CustomizationId,
            e.GuestName,
            e.Email,
            e.Phone,
            e.AttendingStatus,
            e.NumberOfGuests,
            e.DietaryNotes,
            e.Wishes,
            e.CreatedAtUtc)).ToList();

        return Result.Success(new PagedResponse<RsvpResponse>(response, total, page, pageSize));
    }
}
