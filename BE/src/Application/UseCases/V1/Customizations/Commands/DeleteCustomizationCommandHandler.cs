namespace OnePortal.Application.UseCases.V1.Customizations.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Customizations.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories;

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
