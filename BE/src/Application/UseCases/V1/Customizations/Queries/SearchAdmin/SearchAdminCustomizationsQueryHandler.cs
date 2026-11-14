namespace OnePortal.Application.UseCases.V1.Customizations.Queries.SearchAdmin;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Customizations.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Domain.Repositories;

public sealed class SearchAdminCustomizationsQueryHandler(ICustomizationRepository repository, ITenantContext? scope = null)
    : IQueryHandler<SearchAdminCustomizationsQuery, PagedResponse<CustomizationSummaryResponse>>
{
    private readonly ICustomizationRepository _repository = repository;
    public async Task<Result<PagedResponse<CustomizationSummaryResponse>>> Handle(SearchAdminCustomizationsQuery request, CancellationToken cancellationToken)
    {
        if (request.CurrentUserId == Guid.Empty || request.CurrentUserRole != "Admin")
            return Result.Failure<PagedResponse<CustomizationSummaryResponse>>(CustomizationErrors.Unauthorized);
        var page = Math.Clamp(request.Page, 1, 1_000_000);
        var size = Math.Clamp(request.PageSize, 1, 100);
        var values = await _repository.SearchAsync(null, request.Ownerless, page, size, cancellationToken);
        return Result.Success(new PagedResponse<CustomizationSummaryResponse>(
            values.Data.Select(item => CustomizationRules.Summary(item, scope?.TenantKey)).ToList(), values.Total, page, size));
    }
}
