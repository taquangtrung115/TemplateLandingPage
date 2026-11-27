namespace OnePortal.Application.UseCases.V1.Queries.Tenancy;

using OnePortal.Contract.Services.V1.Tenancy;
using System.Text.RegularExpressions;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;

public sealed class GetWorkspaceApplicationsQueryHandler(ITenantStore store)
    : IQueryHandler<GetWorkspaceApplicationsQuery, GetWorkspaceApplicationsResult>
{
    #region Queries
    public async Task<Result<GetWorkspaceApplicationsResult>> Handle(GetWorkspaceApplicationsQuery request, CancellationToken cancellationToken)
    {
        if (!Regex.IsMatch(request.TenantKey, "\\A[a-z0-9][a-z0-9-]{1,62}\\z"))
            return Result.Failure<GetWorkspaceApplicationsResult>(TenancyErrors.NotFound);

        var workspace = await store.GetWorkspaceApplicationsAsync(request.TenantKey, cancellationToken);
        return workspace is null
            ? Result.Failure<GetWorkspaceApplicationsResult>(TenancyErrors.NotFound)
            : Result.Success(new GetWorkspaceApplicationsResult(workspace.TenantName, workspace.AppKeys));
    }
    #endregion
}
