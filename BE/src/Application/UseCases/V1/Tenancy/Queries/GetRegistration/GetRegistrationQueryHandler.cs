namespace OnePortal.Application.UseCases.V1.Tenancy.Queries.GetRegistration;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;

public sealed class GetRegistrationQueryHandler(ITenantStore store, ITenantContext scope) : IQueryHandler<GetRegistrationQuery, GetRegistrationResult>
{
    #region Queries
    public async Task<Result<GetRegistrationResult>> Handle(GetRegistrationQuery request, CancellationToken cancellationToken)
    {
        if (scope.TenantId is not Guid tenantId || scope.AppKey is null) return Result.Failure<GetRegistrationResult>(TenancyErrors.NotFound);
        var settings = await store.GetRegistrationAsync(tenantId, scope.AppKey, cancellationToken);
        return settings is null ? Result.Failure<GetRegistrationResult>(TenancyErrors.NotFound) : Result.Success(new GetRegistrationResult(settings));
    }
    #endregion
}
