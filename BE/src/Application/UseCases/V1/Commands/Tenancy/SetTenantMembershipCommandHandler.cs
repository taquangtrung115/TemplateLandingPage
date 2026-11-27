namespace OnePortal.Application.UseCases.V1.Commands.Tenancy;

using OnePortal.Contract.Services.V1.Tenancy;
using OnePortal.Domain.Entities.Tenancy;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;

public sealed class SetTenantMembershipCommandHandler(ITenantStore store, IRequestActor actor, ITenantContext scope) : ICommandHandler<SetTenantMembershipCommand, SetTenantMembershipResult>
{
    #region Commands
    public async Task<Result<SetTenantMembershipResult>> Handle(SetTenantMembershipCommand request, CancellationToken cancellationToken)
    {
        if (!actor.IsPlatformAdmin && !(actor.Role == "Admin" && scope.TenantId == request.TenantId && scope.AppKey == request.AppKey))
            return Result.Failure<SetTenantMembershipResult>(TenancyErrors.Forbidden);
        if (!TenantDefaults.IsSupportedApplication(request.AppKey) || request.Role is not ("Admin" or "User") || string.IsNullOrWhiteSpace(request.Email))
            return Result.Failure<SetTenantMembershipResult>(TenancyErrors.Invalid);
        var result = await store.SetMembershipAsync(request.TenantId, request.AppKey, request.Email, request.Role, request.IsActive, cancellationToken);
        return result.IsSuccess ? Result.Success(new SetTenantMembershipResult(result.Value)) : Result.Failure<SetTenantMembershipResult>(result.Error);
    }
    #endregion
}
