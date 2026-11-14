namespace OnePortal.Application.UseCases.V1.Customizations.Queries;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Customizations.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Domain.Repositories;

public sealed class GetMyCustomizationsQueryHandler(ICustomizationRepository customizationRepository, ITenantContext? scope = null)
    : IQueryHandler<GetMyCustomizationsQuery, PagedResponse<CustomizationSummaryResponse>>
{
    private readonly ICustomizationRepository _repository = customizationRepository;
    public async Task<Result<PagedResponse<CustomizationSummaryResponse>>> Handle(GetMyCustomizationsQuery request, CancellationToken cancellationToken)
    {
        if (request.UserId == Guid.Empty) return Result.Failure<PagedResponse<CustomizationSummaryResponse>>(CustomizationErrors.Unauthorized);
        var page = Math.Clamp(request.Page, 1, 1_000_000);
        var size = Math.Clamp(request.PageSize, 1, 100);
        var result = await _repository.SearchAsync(request.UserId, false, page, size, cancellationToken);
        return Result.Success(new PagedResponse<CustomizationSummaryResponse>(result.Data.Select(item => CustomizationRules.Summary(item, scope?.TenantKey)).ToList(), result.Total, page, size));
    }
}
