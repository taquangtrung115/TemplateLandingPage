namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Queries.GetVersions;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Application.UseCases.V1.Customizations.Helpers;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetCustomizationVersionsQueryHandler(ICustomizationRepository repository)
    : IQueryHandler<GetCustomizationVersionsQuery, PagedResponse<CustomizationVersionResponse>>
{
    private readonly ICustomizationRepository _repository = repository;
    public async Task<Result<PagedResponse<CustomizationVersionResponse>>> Handle(GetCustomizationVersionsQuery request, CancellationToken cancellationToken)
    {
        var site = await _repository.ReadAccessAsync(request.Id, cancellationToken);
        if (site is null) return Result.Failure<PagedResponse<CustomizationVersionResponse>>(CustomizationErrors.NotFound);
        if (!CustomizationRules.CanAccess(site, request.CurrentUserId, request.CurrentUserRole))
            return Result.Failure<PagedResponse<CustomizationVersionResponse>>(CustomizationErrors.Unauthorized);
        var page = Math.Clamp(request.Page, 1, 1_000_000);
        var size = Math.Clamp(request.PageSize, 1, 100);
        var values = await _repository.GetVersionsAsync(site.Id, page, size, cancellationToken);
        return Result.Success(new PagedResponse<CustomizationVersionResponse>(values.Data.Select(v =>
            new CustomizationVersionResponse(v.Id, v.CustomizationId, v.VersionNumber, v.Title, v.IsPublic, v.CreatedAtUtc,
                v.PublishedAtUtc, CustomizationRules.VersionUrl(site.Slug, v.VersionNumber), IsMain: site.PublishedVersionId == v.Id)).ToList(), values.Total, page, size));
    }
}
