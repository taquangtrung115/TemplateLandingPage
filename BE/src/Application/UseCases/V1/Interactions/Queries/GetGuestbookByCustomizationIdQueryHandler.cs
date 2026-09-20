namespace TemplateLandingPage.Application.UseCases.V1.Interactions.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Interactions;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetGuestbookByCustomizationIdQueryHandler : IQueryHandler<GetGuestbookByCustomizationIdQuery, List<GuestbookResponse>>
{
    private readonly IGuestbookRepository _guestbookRepository;

    public GetGuestbookByCustomizationIdQueryHandler(IGuestbookRepository guestbookRepository)
    {
        _guestbookRepository = guestbookRepository;
    }

    public async Task<Result<List<GuestbookResponse>>> Handle(GetGuestbookByCustomizationIdQuery request, CancellationToken cancellationToken)
    {
        var entries = await _guestbookRepository.GetByCustomizationIdAsync(request.CustomizationId, cancellationToken);
        var response = entries.Select(e => new GuestbookResponse(
            e.Id,
            e.CustomizationId,
            e.SenderName,
            e.Message,
            e.CreatedAtUtc)).ToList();

        return Result.Success(response);
    }
}
