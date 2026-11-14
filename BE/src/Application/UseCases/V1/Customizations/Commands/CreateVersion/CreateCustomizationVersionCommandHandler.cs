namespace OnePortal.Application.UseCases.V1.Customizations.Commands.CreateVersion;

using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Customizations.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Repositories;

public sealed class CreateCustomizationVersionCommandHandler(ICustomizationRepository repository,
    IUnitOfWork unitOfWork, ILogger<CreateCustomizationVersionCommandHandler> logger)
    : ICommandHandler<CreateCustomizationVersionCommand, CustomizationMutationResponse>
{
    private readonly ICustomizationRepository _repository = repository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ILogger _logger = logger;

    public async Task<Result<CustomizationMutationResponse>> Handle(CreateCustomizationVersionCommand request, CancellationToken cancellationToken)
    {
        var site = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (site is null) return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.NotFound);
        if (!CustomizationRules.CanAccess(site, request.CurrentUserId, request.CurrentUserRole))
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Unauthorized);
        if (request.RequestId == Guid.Empty || !CustomizationRules.IsValidDraft(request.Title, request.Slug, request.ConfigJson))
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.InvalidRequest);

        var hash = CustomizationRules.Hash(request.Title, request.Slug, request.ConfigJson);
        var prior = await _repository.GetVersionByRequestAsync(site.Id, request.RequestId, cancellationToken);
        if (prior is not null)
            return prior.RequestHash == hash
                ? Result.Success(new CustomizationMutationResponse(site.Id, prior.SourceRevision, prior.Id, prior.VersionNumber))
                : Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Conflict);
        if (site.Revision != request.ExpectedRevision)
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Conflict);
        var slugError = await CustomizationRules.ReserveSlugAsync(_repository, site.Id, request.Slug, cancellationToken);
        if (slugError is not null) return Result.Failure<CustomizationMutationResponse>(slugError);

        site.SaveDraft(request.Title, request.Slug, request.ConfigJson, request.RequestId, hash);
        var version = CustomizationVersion.Create(site, request.RequestId, hash);
        _repository.AddVersion(version);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Created version {VersionId} for site {SiteId}, operation {RequestId}", version.Id, site.Id, request.RequestId);
        return Result.Success(new CustomizationMutationResponse(site.Id, site.Revision, version.Id, version.VersionNumber));
    }
}
