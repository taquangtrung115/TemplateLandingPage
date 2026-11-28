namespace OnePortal.Application.UseCases.V1.Commands.Tenancy;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Tenancy;
using OnePortal.Domain.Entities.Tenancy;

public sealed class RemoveTenantMemberCommandHandler(ITenantStore store, IRequestActor actor) : ICommandHandler<RemoveTenantMemberCommand, bool>
{
    private readonly ITenantStore _store = store;
    private readonly IRequestActor _actor = actor;

    public async Task<Result<bool>> Handle(RemoveTenantMemberCommand request, CancellationToken cancellationToken)
    {
        if (!_actor.IsPlatformAdmin) return Result.Failure<bool>(TenancyErrors.Forbidden);
        if (!TenantDefaults.IsSupportedApplication(request.AppKey)) return Result.Failure<bool>(TenancyErrors.Invalid);
        return await _store.RemoveMembershipAsync(request.TenantId, request.AppKey, request.UserId, cancellationToken);
    }
}
