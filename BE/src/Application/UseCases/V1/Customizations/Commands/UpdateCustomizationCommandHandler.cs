namespace OnePortal.Application.UseCases.V1.Customizations.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Customizations.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories;

public sealed class UpdateCustomizationCommandHandler(ICustomizationRepository customizationRepository, IUnitOfWork unitOfWork)
    : ICommandHandler<UpdateCustomizationCommand, CustomizationMutationResponse>
{
    private readonly ICustomizationRepository _repository = customizationRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<Result<CustomizationMutationResponse>> Handle(UpdateCustomizationCommand request, CancellationToken cancellationToken)
    {
        var site = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (site is null) return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.NotFound);
        if (!CustomizationRules.CanAccess(site, request.CurrentUserId, request.CurrentUserRole))
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Unauthorized);
        if (!CustomizationRules.IsValidDraft(request.Title, request.Slug, request.ConfigJson) ||
            !request.RequestId.HasValue || request.RequestId == Guid.Empty)
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.InvalidRequest);

        var hash = CustomizationRules.Hash(request.Title, request.Slug, request.ConfigJson);
        if (site.LastSaveRequestId == request.RequestId)
            return site.LastSaveRequestHash == hash
                ? Result.Success(new CustomizationMutationResponse(site.Id, site.LastSaveRevision ?? site.Revision))
                : Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Conflict);
        if (request.ExpectedRevision != site.Revision)
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Conflict);
        var slugError = await CustomizationRules.ReserveSlugAsync(_repository, site.Id, request.Slug, cancellationToken);
        if (slugError is not null) return Result.Failure<CustomizationMutationResponse>(slugError);

        site.SaveDraft(request.Title, request.Slug, request.ConfigJson, request.RequestId.Value, hash);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(new CustomizationMutationResponse(site.Id, site.Revision));
    }
}
