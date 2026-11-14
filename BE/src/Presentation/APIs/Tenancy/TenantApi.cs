namespace OnePortal.Presentation.APIs.Tenancy;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Tenancy.Commands.Create;
using OnePortal.Application.UseCases.V1.Tenancy.Commands.Update;
using OnePortal.Application.UseCases.V1.Tenancy.Commands.ConfigureApplication;
using OnePortal.Application.UseCases.V1.Tenancy.Commands.SetMembership;
using OnePortal.Application.UseCases.V1.Tenancy.Queries.Search;
using OnePortal.Application.UseCases.V1.Tenancy.Queries.GetContexts;
using OnePortal.Application.UseCases.V1.Tenancy.Queries.GetMembers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Presentation.Abstractions;

public sealed class TenantApi : IEndpoint
{
    #region Routes
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/auth/contexts", async (string appKey, int? page, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetTenantContextsQuery(appKey, page ?? 1), ct))).RequireAuthorization();
        app.MapGet("/api/v1/context", (ITenantContext scope, IRequestActor actor) => Results.Ok(Result.Success(new { scope.TenantId, scope.AppKey, actor.Role, actor.IsPlatformAdmin }))).RequireAuthorization();

        var platform = app.MapGroup("/api/v1/platform/tenants").RequireAuthorization("PlatformAdmin");
        platform.MapGet("", async (int? page, int? pageSize, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new SearchTenantsQuery(page ?? 1, pageSize ?? 20), ct)));
        platform.MapPost("", async (CreateTenantCommand request, ISender sender, CancellationToken ct) => Respond(await sender.Send(request, ct), 201));
        platform.MapPut("/{tenantId:guid}", async (Guid tenantId, UpdateTenantCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = tenantId }, ct)));
        platform.MapPut("/{tenantId:guid}/applications/{appKey}", async (Guid tenantId, string appKey, ConfigureTenantApplicationCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = tenantId, AppKey = appKey }, ct)));
        platform.MapGet("/{tenantId:guid}/applications/{appKey}/members", async (Guid tenantId, string appKey, int? page, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetTenantMembersQuery(tenantId, appKey, page ?? 1), ct)));
        platform.MapPut("/{tenantId:guid}/applications/{appKey}/members", async (Guid tenantId, string appKey, SetTenantMembershipCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = tenantId, AppKey = appKey }, ct)));

        var members = app.MapGroup("/api/v1/members").RequireAuthorization("Admin");
        members.MapGet("", async (int? page, ITenantContext scope, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetTenantMembersQuery(scope.TenantId ?? Guid.Empty, scope.AppKey ?? "", page ?? 1), ct)));
        members.MapPut("", async (SetTenantMembershipCommand request, ITenantContext scope, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = scope.TenantId ?? Guid.Empty, AppKey = scope.AppKey ?? "" }, ct)));
    }
    #endregion

    private static IResult Respond<T>(Result<T> result, int status = 200) => result.IsSuccess ? Results.Json(result, statusCode: status)
        : Results.Json(new { error = result.Error }, statusCode: result.Error.Code.EndsWith("Forbidden", StringComparison.Ordinal) ? 403
            : result.Error.Code.EndsWith("NotFound", StringComparison.Ordinal) ? 404 : result.Error.Code.EndsWith("Conflict", StringComparison.Ordinal) ? 409 : 400);
}
