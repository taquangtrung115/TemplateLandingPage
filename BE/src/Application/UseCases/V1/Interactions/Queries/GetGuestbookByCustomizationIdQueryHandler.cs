namespace OnePortal.Application.UseCases.V1.Interactions.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Interactions;
using OnePortal.Application.UseCases.V1.Interactions.Helpers;
using OnePortal.Domain.Repositories;

public sealed class GetGuestbookByCustomizationIdQueryHandler : IQueryHandler<GetGuestbookByCustomizationIdQuery, PagedResponse<GuestbookResponse>>
{
    private readonly IGuestbookRepository _guestbookRepository;
    private readonly ICustomizationRepository _customizationRepository;

    public GetGuestbookByCustomizationIdQueryHandler(IGuestbookRepository guestbookRepository, ICustomizationRepository customizationRepository)
    {
        _guestbookRepository = guestbookRepository;
        _customizationRepository = customizationRepository;
    }

    public async Task<Result<PagedResponse<GuestbookResponse>>> Handle(GetGuestbookByCustomizationIdQuery request, CancellationToken cancellationToken)
    {
        if (!request.VersionId.HasValue || request.VersionId.Value == Guid.Empty)
        {
            return Result.Failure<PagedResponse<GuestbookResponse>>(InteractionErrors.VersionRequired);
        }

        var customization = await _customizationRepository.ReadAccessAsync(request.CustomizationId, cancellationToken);
        if (customization is null)
        {
            return Result.Failure<PagedResponse<GuestbookResponse>>(InteractionErrors.NotFound);
        }

        var version = await _customizationRepository.ReadVersionAsync(
            request.CustomizationId,
            request.VersionId.Value,
            cancellationToken);
        if (version is null)
        {
            return Result.Failure<PagedResponse<GuestbookResponse>>(InteractionErrors.NotFound);
        }

        var isPublic = version.IsPublic;
        var hasOwnerAccess = request.IsAdmin ||
            (request.CurrentUserId.HasValue && customization.UserId == request.CurrentUserId.Value);

        if (!isPublic && !hasOwnerAccess)
        {
            return Result.Failure<PagedResponse<GuestbookResponse>>(InteractionErrors.NotFound);
        }

        if (!InteractionFeatureAvailability.IsEnabled(version.ConfigJson, "wishes") && !hasOwnerAccess)
        {
            return Result.Failure<PagedResponse<GuestbookResponse>>(InteractionErrors.NotFound);
        }

        var page = Math.Clamp(request.Page, 1, 1_000_000);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var (entries, total) = await _guestbookRepository.GetPageByCustomizationVersionIdAsync(
            version.Id,
            page,
            pageSize,
            cancellationToken);
        var response = entries.Select(e => new GuestbookResponse(
            e.SenderName,
            e.Message,
            e.CreatedAtUtc)).ToList();

        return Result.Success(new PagedResponse<GuestbookResponse>(response, total, page, pageSize));
    }
}
