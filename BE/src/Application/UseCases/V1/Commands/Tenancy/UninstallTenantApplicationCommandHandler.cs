namespace OnePortal.Application.UseCases.V1.Commands.Tenancy;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Tenancy;
using OnePortal.Domain.Entities.Tenancy;

public sealed class UninstallTenantApplicationCommandHandler(ITenantStore store, IRequestActor actor) : ICommandHandler<UninstallTenantApplicationCommand, ConfigureTenantApplicationResult>
{
    private readonly ITenantStore _store = store;
    private readonly IRequestActor _actor = actor;

    public async Task<Result<ConfigureTenantApplicationResult>> Handle(UninstallTenantApplicationCommand request, CancellationToken cancellationToken)
    {
        if (!_actor.IsPlatformAdmin) return Result.Failure<ConfigureTenantApplicationResult>(TenancyErrors.Forbidden);
        if (!TenantDefaults.IsSupportedApplication(request.AppKey)) return Result.Failure<ConfigureTenantApplicationResult>(TenancyErrors.Invalid);
        var result = await _store.UninstallApplicationAsync(request.TenantId, request.AppKey, request.PurgeData, cancellationToken);
        return result.IsSuccess ? Result.Success(new ConfigureTenantApplicationResult(result.Value)) : Result.Failure<ConfigureTenantApplicationResult>(result.Error);
    }
}
