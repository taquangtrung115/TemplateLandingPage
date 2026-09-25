namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Queries;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Application.UseCases.V1.Customizations.Helpers;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetMyCustomizationsQueryHandler(ICustomizationRepository customizationRepository)
    : IQueryHandler<GetMyCustomizationsQuery, PagedResponse<CustomizationSummaryResponse>>
{
    private readonly ICustomizationRepository _repository = customizationRepository;
    public async Task<Result<PagedResponse<CustomizationSummaryResponse>>> Handle(GetMyCustomizationsQuery request, CancellationToken cancellationToken)
    {
        if (request.UserId == Guid.Empty) return Result.Failure<PagedResponse<CustomizationSummaryResponse>>(CustomizationErrors.Unauthorized);
        var page = Math.Clamp(request.Page, 1, 1_000_000);
        var size = Math.Clamp(request.PageSize, 1, 100);
        var result = await _repository.SearchAsync(request.UserId, false, page, size, cancellationToken);
        return Result.Success(new PagedResponse<CustomizationSummaryResponse>(result.Data.Select(CustomizationRules.Summary).ToList(), result.Total, page, size));
    }
}
