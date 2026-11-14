namespace OnePortal.Application.UseCases.V1.Tenancy.Commands.ConfigureRegistration;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;

public sealed class ConfigureRegistrationCommandHandler(ITenantStore store, IRequestActor actor, ITenantContext scope)
    : ICommandHandler<ConfigureRegistrationCommand, ConfigureRegistrationResult>
{
    #region Commands
    public async Task<Result<ConfigureRegistrationResult>> Handle(ConfigureRegistrationCommand request, CancellationToken cancellationToken)
    {
        if (scope.TenantId is not Guid tenantId || scope.AppKey is not ("landing" or "quoting") || actor.Role != "Admin")
            return Result.Failure<ConfigureRegistrationResult>(TenancyErrors.Forbidden);
        var result = await store.ConfigureRegistrationAsync(tenantId, scope.AppKey, request.AllowSelfRegistration, cancellationToken);
        return result.IsSuccess ? Result.Success(new ConfigureRegistrationResult(result.Value)) : Result.Failure<ConfigureRegistrationResult>(result.Error);
    }
    #endregion
}
