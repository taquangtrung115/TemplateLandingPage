namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Commands;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Repositories;

public sealed class UpdateCustomizationCommandHandler : ICommandHandler<UpdateCustomizationCommand>
{
    private readonly ICustomizationRepository _customizationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCustomizationCommandHandler(
        ICustomizationRepository customizationRepository,
        IUnitOfWork unitOfWork)
    {
        _customizationRepository = customizationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UpdateCustomizationCommand request, CancellationToken cancellationToken)
    {
        var customization = await _customizationRepository.GetByIdAsync(request.Id, cancellationToken);
        if (customization is null)
        {
            return Result.Failure(CustomizationErrors.NotFound);
        }

        // Check ownership if user is not admin
        if (request.CurrentUserRole != "Admin" && request.CurrentUserId.HasValue && customization.UserId.HasValue)
        {
            if (customization.UserId.Value != request.CurrentUserId.Value)
            {
                return Result.Failure(CustomizationErrors.Unauthorized);
            }
        }

        var existingWithSlug = await _customizationRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (existingWithSlug is not null && existingWithSlug.Id != request.Id)
        {
            return Result.Failure(CustomizationErrors.DuplicateSlug);
        }

        customization.Update(request.Title, request.Slug, request.ConfigJson, request.IsPublished);
        _customizationRepository.Update(customization);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
