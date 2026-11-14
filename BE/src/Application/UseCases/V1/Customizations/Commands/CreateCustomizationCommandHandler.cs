namespace OnePortal.Application.UseCases.V1.Customizations.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Customizations.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Contract.Services.V1.Templates;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Repositories;

public sealed class CreateCustomizationCommandHandler(
    ICustomizationRepository customizationRepository, ITemplateRepository templateRepository, IUnitOfWork unitOfWork)
    : ICommandHandler<CreateCustomizationCommand, CustomizationMutationResponse>
{
    private readonly ICustomizationRepository _repository = customizationRepository;
    private readonly ITemplateRepository _templates = templateRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<Result<CustomizationMutationResponse>> Handle(CreateCustomizationCommand request, CancellationToken cancellationToken)
    {
        if (!request.UserId.HasValue || request.UserId == Guid.Empty)
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Unauthorized);
        if (!request.ClientDraftId.HasValue || request.ClientDraftId == Guid.Empty ||
            !CustomizationRules.IsValidDraft(request.Title, request.Slug, request.ConfigJson))
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.InvalidRequest);

        var existing = await _repository.GetByClientDraftIdAsync(request.UserId.Value, request.ClientDraftId.Value, cancellationToken);
        if (existing is not null)
        {
            if (existing.IsDeleted || existing.TemplateId != request.TemplateId || existing.Revision != 1 ||
                CustomizationRules.Hash(existing.Title, existing.Slug, existing.ConfigJson) !=
                CustomizationRules.Hash(request.Title, request.Slug, request.ConfigJson))
                return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Conflict);
            return Result.Success(new CustomizationMutationResponse(existing.Id, existing.Revision));
        }

        var template = await _templates.GetByIdAsync(request.TemplateId, cancellationToken);
        if (template is null || !template.IsActive)
            return Result.Failure<CustomizationMutationResponse>(TemplateErrors.NotFound);
        var customization = UserCustomization.Create(request.UserId.Value, request.TemplateId, request.Title,
            request.Slug, request.ConfigJson, false);
        customization.SetClientDraftId(request.ClientDraftId.Value);
        var slugError = await CustomizationRules.ReserveSlugAsync(_repository, customization.Id, request.Slug, cancellationToken);
        if (slugError is not null) return Result.Failure<CustomizationMutationResponse>(slugError);

        _repository.Add(customization);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(new CustomizationMutationResponse(customization.Id, customization.Revision));
    }
}
