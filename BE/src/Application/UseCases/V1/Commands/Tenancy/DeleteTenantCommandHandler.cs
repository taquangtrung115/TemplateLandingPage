namespace OnePortal.Application.UseCases.V1.Commands.Tenancy;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Tenancy;

public sealed class DeleteTenantCommandHandler(ITenantStore store, IRequestActor actor) : ICommandHandler<DeleteTenantCommand, bool>
{
    private readonly ITenantStore _store = store;
    private readonly IRequestActor _actor = actor;

    public async Task<Result<bool>> Handle(DeleteTenantCommand request, CancellationToken cancellationToken)
    {
        if (!_actor.IsPlatformAdmin) return Result.Failure<bool>(TenancyErrors.Forbidden);
        return await _store.DeleteAsync(request.TenantId, request.ConfirmKey, request.Force, cancellationToken);
    }
}
