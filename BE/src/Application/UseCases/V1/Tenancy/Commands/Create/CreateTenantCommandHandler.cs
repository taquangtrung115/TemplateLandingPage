namespace OnePortal.Application.UseCases.V1.Tenancy.Commands.Create;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;

public sealed class CreateTenantCommandHandler(ITenantStore store, IRequestActor actor) : ICommandHandler<CreateTenantCommand, CreateTenantResult>
{
    #region Commands
    public async Task<Result<CreateTenantResult>> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        if (!actor.IsPlatformAdmin) return Result.Failure<CreateTenantResult>(TenancyErrors.Forbidden);
        if (string.IsNullOrWhiteSpace(request.Key) || !System.Text.RegularExpressions.Regex.IsMatch(request.Key, "^[a-z0-9][a-z0-9-]{1,62}$") || string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length > 200
            || request.Applications is null || request.Applications.Length == 0 || request.Applications.Any(key => key is not ("landing" or "quoting")))
            return Result.Failure<CreateTenantResult>(TenancyErrors.Invalid);
        var result = await store.CreateAsync(request.Key, request.Name, request.Applications.Distinct().ToArray(), request.AdminEmail, cancellationToken);
        return result.IsSuccess ? Result.Success(new CreateTenantResult(result.Value)) : Result.Failure<CreateTenantResult>(result.Error);
    }
    #endregion
}
