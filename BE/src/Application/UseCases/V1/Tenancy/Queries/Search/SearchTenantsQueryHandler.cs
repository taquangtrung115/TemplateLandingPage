namespace OnePortal.Application.UseCases.V1.Tenancy.Queries.Search;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;

public sealed class SearchTenantsQueryHandler(ITenantStore store, IRequestActor actor) : IQueryHandler<SearchTenantsQuery, SearchTenantsResult>
{
    #region Queries
    public async Task<Result<SearchTenantsResult>> Handle(SearchTenantsQuery request, CancellationToken cancellationToken)
    {
        if (!actor.IsPlatformAdmin) return Result.Failure<SearchTenantsResult>(TenancyErrors.Forbidden);
        return Result.Success(new SearchTenantsResult(await store.SearchAsync(Math.Max(1, request.Page), Math.Clamp(request.PageSize, 1, 100), cancellationToken, request.Search?.Trim())));
    }
    #endregion
}
