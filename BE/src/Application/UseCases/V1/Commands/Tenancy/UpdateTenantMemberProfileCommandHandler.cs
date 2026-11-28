namespace OnePortal.Application.UseCases.V1.Commands.Tenancy;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Tenancy;
using OnePortal.Domain.Entities.Tenancy;

public sealed class UpdateTenantMemberProfileCommandHandler(ITenantStore store, IRequestActor actor, IPasswordHasher passwordHasher) : ICommandHandler<UpdateTenantMemberProfileCommand, TenantMemberDto>
{
    private readonly ITenantStore _store = store;
    private readonly IRequestActor _actor = actor;
    private readonly IPasswordHasher _passwordHasher = passwordHasher;

    public async Task<Result<TenantMemberDto>> Handle(UpdateTenantMemberProfileCommand request, CancellationToken cancellationToken)
    {
        if (!_actor.IsPlatformAdmin) return Result.Failure<TenantMemberDto>(TenancyErrors.Forbidden);
        if (request.AppKey is not null && !TenantDefaults.IsSupportedApplication(request.AppKey))
            return Result.Failure<TenantMemberDto>(TenancyErrors.Invalid);
        return await _store.UpdateMemberProfileAsync(request.TenantId, request.UserId, request.FullName.Trim(),
            string.IsNullOrEmpty(request.NewPassword) ? null : _passwordHasher.HashPassword(request.NewPassword), cancellationToken, request.AppKey);
    }
}
