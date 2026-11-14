namespace OnePortal.Application.UseCases.V1.Tenancy.Commands.Update;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;

public sealed class UpdateTenantCommandHandler(ITenantStore store, IRequestActor actor) : ICommandHandler<UpdateTenantCommand, UpdateTenantResult>
{
    #region Commands
    public async Task<Result<UpdateTenantResult>> Handle(UpdateTenantCommand request, CancellationToken cancellationToken)
    {
        if (!actor.IsPlatformAdmin) return Result.Failure<UpdateTenantResult>(TenancyErrors.Forbidden);
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length > 200) return Result.Failure<UpdateTenantResult>(TenancyErrors.Invalid);
        var result = await store.UpdateAsync(request.TenantId, request.Name, request.IsActive, cancellationToken);
        return result.IsSuccess ? Result.Success(new UpdateTenantResult(result.Value)) : Result.Failure<UpdateTenantResult>(result.Error);
    }
    #endregion
}
