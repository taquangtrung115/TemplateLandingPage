namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Commands;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Repositories;

public sealed class DeleteCustomizationCommandHandler : ICommandHandler<DeleteCustomizationCommand>
{
    private readonly ICustomizationRepository _customizationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCustomizationCommandHandler(
        ICustomizationRepository customizationRepository,
        IUnitOfWork unitOfWork)
    {
        _customizationRepository = customizationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteCustomizationCommand request, CancellationToken cancellationToken)
    {
        var customization = await _customizationRepository.GetByIdAsync(request.Id, cancellationToken);
        if (customization is null)
        {
            return Result.Failure(CustomizationErrors.NotFound);
        }

        if (request.CurrentUserRole != "Admin" && request.CurrentUserId.HasValue && customization.UserId.HasValue)
        {
            if (customization.UserId.Value != request.CurrentUserId.Value)
            {
                return Result.Failure(CustomizationErrors.Unauthorized);
            }
        }

        customization.Delete();
        _customizationRepository.Update(customization);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
