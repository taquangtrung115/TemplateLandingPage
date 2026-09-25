namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Queries;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Application.UseCases.V1.Customizations.Helpers;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetCustomizationBySlugQueryHandler(ICustomizationRepository customizationRepository)
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
            request.VersionNumber.HasValue ? CustomizationRules.VersionUrl(value.Slug, value.VersionNumber) : $"/p/{Uri.EscapeDataString(value.Slug)}"));
    }
}
