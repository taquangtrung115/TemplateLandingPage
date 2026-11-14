namespace OnePortal.Application.UseCases.V1.Tenancy.Commands.CreateMember;

using System.ComponentModel.DataAnnotations;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;

public sealed class CreateTenantMemberCommandHandler(ITenantStore store, IRequestActor actor, ITenantContext scope, IPasswordHasher passwordHasher)
    : ICommandHandler<CreateTenantMemberCommand, CreateTenantMemberResult>
{
    #region Commands
    public async Task<Result<CreateTenantMemberResult>> Handle(CreateTenantMemberCommand request, CancellationToken cancellationToken)
    {
        if (!actor.IsPlatformAdmin && !(actor.Role == "Admin" && scope.TenantId == request.TenantId && scope.AppKey == request.AppKey))
            return Result.Failure<CreateTenantMemberResult>(TenancyErrors.Forbidden);
        if (request.TenantId == Guid.Empty || request.AppKey is not ("landing" or "quoting") || request.Role is not ("Admin" or "User")
            || string.IsNullOrWhiteSpace(request.Email) || request.Email.Length > 256 || !new EmailAddressAttribute().IsValid(request.Email.Trim())
            || string.IsNullOrWhiteSpace(request.FullName) || request.FullName.Trim().Length > 100 || request.Password is null || request.Password.Length is < 8 or > 128)
            return Result.Failure<CreateTenantMemberResult>(TenancyErrors.Invalid);
        var result = await store.CreateMemberAsync(request.TenantId, request.AppKey, request.Email.Trim().ToLowerInvariant(), request.FullName.Trim(),
            passwordHasher.HashPassword(request.Password), request.Role, cancellationToken);
        return result.IsSuccess ? Result.Success(new CreateTenantMemberResult(result.Value)) : Result.Failure<CreateTenantMemberResult>(result.Error);
    }
    #endregion
}
