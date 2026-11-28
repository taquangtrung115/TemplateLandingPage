namespace OnePortal.Application.UseCases.V1.Queries.Tenancy;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Tenancy;

public sealed class GetTenantUsersQueryHandler(ITenantStore store, IRequestActor actor) : IQueryHandler<GetTenantUsersQuery, GetTenantUsersResult>
{
    private readonly ITenantStore _store = store;
    private readonly IRequestActor _actor = actor;

    public async Task<Result<GetTenantUsersResult>> Handle(GetTenantUsersQuery request, CancellationToken cancellationToken)
    {
        if (!_actor.IsPlatformAdmin) return Result.Failure<GetTenantUsersResult>(TenancyErrors.Forbidden);
        if (request.Search?.Length > 160) return Result.Failure<GetTenantUsersResult>(TenancyErrors.Invalid);
        return await _store.GetTenantUsersAsync(request.TenantId, request.Search, Math.Clamp(request.Page, 1, 100_000),
            Math.Clamp(request.PageSize, 1, 100), cancellationToken);
    }
}
