namespace OnePortal.Application.UseCases.V1.Commands.Tenancy;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Tenancy;

public sealed class SetTenantWorkspaceMembershipCommandHandler(ITenantStore store, IRequestActor actor, IPasswordHasher passwordHasher) : ICommandHandler<SetTenantWorkspaceMembershipCommand, bool>
{
    private readonly ITenantStore _store = store;
    private readonly IRequestActor _actor = actor;
    private readonly IPasswordHasher _passwordHasher = passwordHasher;

    public async Task<Result<bool>> Handle(SetTenantWorkspaceMembershipCommand request, CancellationToken cancellationToken)
    {
        if (!_actor.IsPlatformAdmin) return Result.Failure<bool>(TenancyErrors.Forbidden);
        return await _store.SetWorkspaceMembershipAsync(request.TenantId, request.Email.Trim().ToLowerInvariant(), request.Role, request.FullName?.Trim(),
            string.IsNullOrEmpty(request.NewPassword) ? null : _passwordHasher.HashPassword(request.NewPassword), cancellationToken);
    }
}
