namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Commands;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Application.UseCases.V1.Customizations.Helpers;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Repositories;

public sealed class DeleteCustomizationCommandHandler(ICustomizationRepository customizationRepository, IUnitOfWork unitOfWork)
    : ICommandHandler<DeleteCustomizationCommand>
{
    private readonly ICustomizationRepository _repository = customizationRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<Result> Handle(DeleteCustomizationCommand request, CancellationToken cancellationToken)
    {
        var site = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (site is null) return Result.Failure(CustomizationErrors.NotFound);
        if (!CustomizationRules.CanAccess(site, request.CurrentUserId, request.CurrentUserRole))
            return Result.Failure(CustomizationErrors.Unauthorized);
        if (site.Revision != request.ExpectedRevision) return Result.Failure(CustomizationErrors.Conflict);
        site.Delete();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
