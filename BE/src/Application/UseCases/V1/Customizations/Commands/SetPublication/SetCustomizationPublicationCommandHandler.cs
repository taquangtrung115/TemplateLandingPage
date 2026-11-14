namespace OnePortal.Application.UseCases.V1.Customizations.Commands.SetPublication;

using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Customizations.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories;

public sealed class SetCustomizationPublicationCommandHandler(ICustomizationRepository repository,
    IUnitOfWork unitOfWork, ILogger<SetCustomizationPublicationCommandHandler> logger)
    : ICommandHandler<SetCustomizationPublicationCommand, CustomizationMutationResponse>
{
    private readonly ICustomizationRepository _repository = repository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ILogger _logger = logger;

    public async Task<Result<CustomizationMutationResponse>> Handle(SetCustomizationPublicationCommand request, CancellationToken cancellationToken)
    {
        var site = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (site is null) return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.NotFound);
        if (!CustomizationRules.CanAccess(site, request.CurrentUserId, request.CurrentUserRole))
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Unauthorized);
        var version = await _repository.GetVersionAsync(site.Id, request.VersionId, cancellationToken);
        if (version is null) return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.NotFound);
        if (site.Revision != request.ExpectedRevision)
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Conflict);
        if (site.PublishedVersionId == version.Id && version.IsPublic)
            return Result.Success(new CustomizationMutationResponse(site.Id, site.Revision, version.Id, version.VersionNumber));
        version.Publish();
        site.SetPublication(version.Id);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Published version {VersionId} for site {SiteId} at revision {Revision}", version.Id, site.Id, site.Revision);
        return Result.Success(new CustomizationMutationResponse(site.Id, site.Revision, version.Id, version.VersionNumber));
    }
}
