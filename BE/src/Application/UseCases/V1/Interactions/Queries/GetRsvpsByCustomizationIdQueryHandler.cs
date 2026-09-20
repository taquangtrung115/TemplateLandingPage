namespace TemplateLandingPage.Application.UseCases.V1.Interactions.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Interactions;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetRsvpsByCustomizationIdQueryHandler : IQueryHandler<GetRsvpsByCustomizationIdQuery, List<RsvpResponse>>
{
    private readonly IRsvpRepository _rsvpRepository;

    public GetRsvpsByCustomizationIdQueryHandler(IRsvpRepository rsvpRepository)
    {
        _rsvpRepository = rsvpRepository;
    }

    public async Task<Result<List<RsvpResponse>>> Handle(GetRsvpsByCustomizationIdQuery request, CancellationToken cancellationToken)
    {
        var entries = await _rsvpRepository.GetByCustomizationIdAsync(request.CustomizationId, cancellationToken);
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

        return Result.Success(response);
    }
}
