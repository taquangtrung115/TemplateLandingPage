namespace OnePortal.Application.UseCases.V1.Commands.Tenancy;

using OnePortal.Contract.Services.V1.Tenancy;
using OnePortal.Domain.Entities.Tenancy;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;

public sealed class ConfigureTenantApplicationCommandHandler(ITenantStore store, IRequestActor actor) : ICommandHandler<ConfigureTenantApplicationCommand, ConfigureTenantApplicationResult>
{
    #region Commands
    public async Task<Result<ConfigureTenantApplicationResult>> Handle(ConfigureTenantApplicationCommand request, CancellationToken cancellationToken)
    {
        if (!actor.IsPlatformAdmin) return Result.Failure<ConfigureTenantApplicationResult>(TenancyErrors.Forbidden);
        if (!TenantDefaults.IsSupportedApplication(request.AppKey)) return Result.Failure<ConfigureTenantApplicationResult>(TenancyErrors.Invalid);
        var result = await store.ConfigureApplicationAsync(request.TenantId, request.AppKey, request.IsEnabled, request.AllowSelfRegistration, cancellationToken);
        return result.IsSuccess ? Result.Success(new ConfigureTenantApplicationResult(result.Value)) : Result.Failure<ConfigureTenantApplicationResult>(result.Error);
    }
    #endregion
}
