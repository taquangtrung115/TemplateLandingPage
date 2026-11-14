namespace OnePortal.Application.UseCases.V1.Customizations.Queries;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Customizations.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Domain.Repositories;

public sealed class GetCustomizationBySlugQueryHandler(ICustomizationRepository customizationRepository, ITenantContext? scope = null)
    : IQueryHandler<GetCustomizationBySlugQuery, PublicCustomizationResponse>
{
    private readonly ICustomizationRepository _repository = customizationRepository;
    public async Task<Result<PublicCustomizationResponse>> Handle(GetCustomizationBySlugQuery request, CancellationToken cancellationToken)
    {
        if (request.VersionNumber is <= 0) return Result.Failure<PublicCustomizationResponse>(CustomizationErrors.NotFound);
        var value = await _repository.GetPublicAsync(request.Slug, request.VersionNumber, cancellationToken);
        if (value is null) return Result.Failure<PublicCustomizationResponse>(CustomizationErrors.NotFound);
        return Result.Success(new PublicCustomizationResponse(value.Id, value.VersionId, value.VersionNumber,
            value.TemplateId, value.Title, value.Slug, value.ConfigJson,
            request.VersionNumber.HasValue ? CustomizationRules.VersionUrl(value.Slug, value.VersionNumber, scope?.TenantKey) : CustomizationRules.SiteUrl(value.Slug, scope?.TenantKey)));
    }
}
