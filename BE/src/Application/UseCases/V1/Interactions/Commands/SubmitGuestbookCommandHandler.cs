namespace TemplateLandingPage.Application.UseCases.V1.Interactions.Commands;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Interactions;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using TemplateLandingPage.Application.UseCases.V1.Interactions.Helpers;

public sealed class SubmitGuestbookCommandHandler : ICommandHandler<SubmitGuestbookCommand, Guid>
{
    private readonly IGuestbookRepository _guestbookRepository;
    private readonly ICustomizationRepository _customizationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SubmitGuestbookCommandHandler(
        IGuestbookRepository guestbookRepository,
        ICustomizationRepository customizationRepository,
        IUnitOfWork unitOfWork)
    {
        _guestbookRepository = guestbookRepository;
        _customizationRepository = customizationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(SubmitGuestbookCommand request, CancellationToken cancellationToken)
    {
        if (!request.CustomizationVersionId.HasValue || request.CustomizationVersionId.Value == Guid.Empty)
        {
            return Result.Failure<Guid>(InteractionErrors.VersionRequired);
        }

        var published = await _customizationRepository.GetPublicVersionAsync(request.CustomizationVersionId.Value, cancellationToken);
        if (published is null)
        {
            return Result.Failure<Guid>(InteractionErrors.VersionUnavailable);
        }

        if (request.CustomizationId.HasValue && request.CustomizationId.Value != published.Id)
        {
            return Result.Failure<Guid>(InteractionErrors.CustomizationMismatch);
        }

        if (!InteractionFeatureAvailability.IsEnabled(published.ConfigJson, "wishes"))
        {
            return Result.Failure<Guid>(InteractionErrors.FeatureDisabled);
        }

        var entry = GuestbookEntry.Create(published.VersionId, published.Id, request.SenderName, request.Message);

        _guestbookRepository.Add(entry);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(entry.Id);
    }
}
