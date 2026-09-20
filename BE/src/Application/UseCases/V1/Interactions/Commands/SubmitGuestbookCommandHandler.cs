namespace TemplateLandingPage.Application.UseCases.V1.Interactions.Commands;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Interactions;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

public sealed class SubmitGuestbookCommandHandler : ICommandHandler<SubmitGuestbookCommand, Guid>
{
    private readonly IGuestbookRepository _guestbookRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SubmitGuestbookCommandHandler(
        IGuestbookRepository guestbookRepository,
        IUnitOfWork unitOfWork)
    {
        _guestbookRepository = guestbookRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(SubmitGuestbookCommand request, CancellationToken cancellationToken)
    {
        var entry = GuestbookEntry.Create(request.CustomizationId, request.SenderName, request.Message);

        _guestbookRepository.Add(entry);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(entry.Id);
    }
}
