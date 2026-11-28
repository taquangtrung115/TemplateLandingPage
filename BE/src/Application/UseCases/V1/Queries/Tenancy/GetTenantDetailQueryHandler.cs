namespace OnePortal.Application.UseCases.V1.Queries.Tenancy;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Tenancy;

public sealed class GetTenantDetailQueryHandler(ITenantStore store, IRequestActor actor) : IQueryHandler<GetTenantDetailQuery, TenantDto>
{
    private readonly ITenantStore _store = store;
    private readonly IRequestActor _actor = actor;

    public async Task<Result<TenantDto>> Handle(GetTenantDetailQuery request, CancellationToken cancellationToken)
    {
        if (!_actor.IsPlatformAdmin) return Result.Failure<TenantDto>(TenancyErrors.Forbidden);
        if (request.TenantId is null && (string.IsNullOrWhiteSpace(request.TenantKey) || request.TenantKey.Length > 63))
            return Result.Failure<TenantDto>(TenancyErrors.Invalid);
        var tenant = await _store.GetDetailAsync(request.TenantId, request.TenantKey?.Trim().ToLowerInvariant(), cancellationToken);
        return tenant is null ? Result.Failure<TenantDto>(TenancyErrors.NotFound) : Result.Success(tenant);
    }
}
