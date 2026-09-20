namespace TemplateLandingPage.Application.UseCases.V1.Interactions.Commands;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Interactions;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

public sealed class SubmitRsvpCommandHandler : ICommandHandler<SubmitRsvpCommand, Guid>
{
    private readonly IRsvpRepository _rsvpRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SubmitRsvpCommandHandler(
        IRsvpRepository rsvpRepository,
        IUnitOfWork unitOfWork)
    {
        _rsvpRepository = rsvpRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(SubmitRsvpCommand request, CancellationToken cancellationToken)
    {
        var entry = RsvpEntry.Create(
            request.CustomizationId,
            request.GuestName,
            request.Email,
            request.Phone,
            request.AttendingStatus,
            request.NumberOfGuests,
            request.DietaryNotes,
            request.Wishes);

        _rsvpRepository.Add(entry);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(entry.Id);
    }
}
