namespace OnePortal.Application.UseCases.V1.Customizations.Queries;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Customizations.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Domain.Repositories;

public sealed class GetCustomizationByIdQueryHandler(ICustomizationRepository customizationRepository, ITemplateRepository templateRepository)
    : IQueryHandler<GetCustomizationByIdQuery, CustomizationResponse>
{
    private readonly ICustomizationRepository _repository = customizationRepository;
    private readonly ITemplateRepository _templates = templateRepository;
    public async Task<Result<CustomizationResponse>> Handle(GetCustomizationByIdQuery request, CancellationToken cancellationToken)
    {
        var site = await _repository.ReadByIdAsync(request.Id, cancellationToken);
        if (site is null) return Result.Failure<CustomizationResponse>(CustomizationErrors.NotFound);
        if (!CustomizationRules.CanAccess(site, request.CurrentUserId, request.CurrentUserRole))
            return Result.Failure<CustomizationResponse>(CustomizationErrors.Unauthorized);
        var templateName = await _templates.GetNameByIdAsync(site.TemplateId, cancellationToken);
        return Result.Success(new CustomizationResponse(site.Id, site.UserId, site.TemplateId, templateName ?? "Template",
            site.Title, site.Slug, site.ConfigJson, site.PublishedVersionId.HasValue, site.CreatedAtUtc, site.Revision,
            site.LastVersionNumber, site.PublishedVersionId, site.ClientDraftId));
    }
}
