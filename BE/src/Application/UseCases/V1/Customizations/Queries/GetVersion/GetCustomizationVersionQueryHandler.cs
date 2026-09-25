namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Queries.GetVersion;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Application.UseCases.V1.Customizations.Helpers;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetCustomizationVersionQueryHandler(ICustomizationRepository repository)
    : IQueryHandler<GetCustomizationVersionQuery, CustomizationVersionResponse>
{
    private readonly ICustomizationRepository _repository = repository;
    public async Task<Result<CustomizationVersionResponse>> Handle(GetCustomizationVersionQuery request, CancellationToken cancellationToken)
    {
        var site = await _repository.ReadAccessAsync(request.Id, cancellationToken);
        if (site is null) return Result.Failure<CustomizationVersionResponse>(CustomizationErrors.NotFound);
        if (!CustomizationRules.CanAccess(site, request.CurrentUserId, request.CurrentUserRole))
            return Result.Failure<CustomizationVersionResponse>(CustomizationErrors.Unauthorized);
        var value = await _repository.ReadVersionAsync(site.Id, request.VersionId, cancellationToken);
        if (value is null) return Result.Failure<CustomizationVersionResponse>(CustomizationErrors.NotFound);
        return Result.Success(new CustomizationVersionResponse(value.Id, site.Id, value.VersionNumber, value.Title,
            value.IsPublic, value.CreatedAtUtc, value.PublishedAtUtc, CustomizationRules.VersionUrl(site.Slug, value.VersionNumber), value.ConfigJson,
            site.PublishedVersionId == value.Id));
    }
}
