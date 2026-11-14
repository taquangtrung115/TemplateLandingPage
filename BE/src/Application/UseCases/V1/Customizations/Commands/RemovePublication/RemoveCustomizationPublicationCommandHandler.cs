namespace OnePortal.Application.UseCases.V1.Customizations.Commands.RemovePublication;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Customizations.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories;

public sealed class RemoveCustomizationPublicationCommandHandler(ICustomizationRepository repository, IUnitOfWork unitOfWork)
    : ICommandHandler<RemoveCustomizationPublicationCommand, CustomizationMutationResponse>
{
    private readonly ICustomizationRepository _repository = repository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<Result<CustomizationMutationResponse>> Handle(RemoveCustomizationPublicationCommand request, CancellationToken cancellationToken)
    {
        var site = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (site is null) return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.NotFound);
        if (!CustomizationRules.CanAccess(site, request.CurrentUserId, request.CurrentUserRole))
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Unauthorized);
        if (site.Revision != request.ExpectedRevision)
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Conflict);
        if (request.VersionId.HasValue)
        {
            var version = await _repository.GetVersionAsync(site.Id, request.VersionId.Value, cancellationToken);
            if (version is null) return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.NotFound);
            version.Unpublish();
            if (site.PublishedVersionId == version.Id) site.SetPublication(null);
            else site.Touch();
        }
        else
        {
            var versions = await _repository.GetPublishedVersionsAsync(site.Id, cancellationToken);
            foreach (var version in versions) version.Unpublish();
            site.SetPublication(null);
        }
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(new CustomizationMutationResponse(site.Id, site.Revision));
    }
}
