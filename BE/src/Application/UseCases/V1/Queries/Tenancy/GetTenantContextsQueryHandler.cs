namespace OnePortal.Application.UseCases.V1.Queries.Tenancy;

using OnePortal.Contract.Services.V1.Tenancy;
using OnePortal.Domain.Entities.Tenancy;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;

public sealed class GetTenantContextsQueryHandler(ITenantStore store, IRequestActor actor) : IQueryHandler<GetTenantContextsQuery, GetTenantContextsResult>
{
    #region Queries
    public async Task<Result<GetTenantContextsResult>> Handle(GetTenantContextsQuery request, CancellationToken cancellationToken)
    {
        if (!actor.UserId.HasValue) return Result.Failure<GetTenantContextsResult>(TenancyErrors.Forbidden);
        if (!TenantDefaults.IsSupportedApplication(request.AppKey)) return Result.Failure<GetTenantContextsResult>(TenancyErrors.Invalid);
        return Result.Success(new GetTenantContextsResult(await store.GetContextsAsync(actor.UserId.Value, request.AppKey, Math.Max(1, request.Page), Math.Clamp(request.PageSize, 1, 100), cancellationToken)));
    }
    #endregion
}
