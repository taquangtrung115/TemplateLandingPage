namespace OnePortal.Application.UseCases.V1.Tenancy.Queries.GetMembers;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;

public sealed class GetTenantMembersQueryHandler(ITenantStore store, IRequestActor actor, ITenantContext scope) : IQueryHandler<GetTenantMembersQuery, GetTenantMembersResult>
{
    #region Queries
    public async Task<Result<GetTenantMembersResult>> Handle(GetTenantMembersQuery request, CancellationToken cancellationToken)
    {
        if (!actor.IsPlatformAdmin && !(actor.Role == "Admin" && scope.TenantId == request.TenantId && scope.AppKey == request.AppKey))
            return Result.Failure<GetTenantMembersResult>(TenancyErrors.Forbidden);
        return Result.Success(new GetTenantMembersResult(await store.GetMembersAsync(request.TenantId, request.AppKey, Math.Max(1, request.Page), Math.Clamp(request.PageSize, 1, 100), cancellationToken)));
    }
    #endregion
}
