namespace OnePortal.Presentation.APIs.Tenancy;

using OnePortal.Contract.Services.V1.Tenancy;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Commands.Tenancy;
using OnePortal.Application.UseCases.V1.Queries.Tenancy;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Presentation.Abstractions;

public sealed class TenantApi : IEndpoint
{
    #region Routes
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/portal/workspaces/{tenantKey}/applications", async (string tenantKey, ISender sender, HttpContext context, CancellationToken ct) =>
        {
            context.Response.Headers.CacheControl = "no-store";
            return Respond(await sender.Send(new GetWorkspaceApplicationsQuery(tenantKey), ct));
        }).AllowAnonymous();
        app.MapGet("/api/v1/auth/contexts", async (string appKey, int? page, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetTenantContextsQuery(appKey, page ?? 1), ct))).RequireAuthorization();
        app.MapGet("/api/v1/context", (ITenantContext scope, IRequestActor actor) => Results.Ok(Result.Success(new { scope.TenantId, scope.AppKey, actor.Role, actor.IsPlatformAdmin }))).RequireAuthorization();

        var platform = app.MapGroup("/api/v1/platform/tenants").RequireAuthorization("PlatformAdmin");
        platform.MapGet("", async (int? page, int? pageSize, string? search, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new SearchTenantsQuery(page ?? 1, pageSize ?? 20, search), ct)));
        platform.MapPost("", async (CreateTenantCommand request, ISender sender, CancellationToken ct) => Respond(await sender.Send(request, ct), 201));
        platform.MapGet("/{tenantId:guid}", async (Guid tenantId, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetTenantDetailQuery(tenantId), ct)));
        platform.MapGet("/by-key/{tenantKey}", async (string tenantKey, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetTenantDetailQuery(null, tenantKey), ct)));
        platform.MapPut("/{tenantId:guid}", async (Guid tenantId, UpdateTenantCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = tenantId }, ct)));
        platform.MapDelete("/{tenantId:guid}", async (Guid tenantId, [FromBody] DeleteTenantCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = tenantId }, ct)));
        platform.MapPut("/{tenantId:guid}/applications/{appKey}", async (Guid tenantId, string appKey, ConfigureTenantApplicationCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = tenantId, AppKey = appKey }, ct)));
        platform.MapDelete("/{tenantId:guid}/applications/{appKey}", async (Guid tenantId, string appKey, bool? purgeData, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new UninstallTenantApplicationCommand(tenantId, appKey, purgeData ?? false), ct)));
        platform.MapGet("/{tenantId:guid}/members", async (Guid tenantId, string? search, int? page, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetTenantUsersQuery(tenantId, search, page ?? 1), ct)));
        platform.MapPut("/{tenantId:guid}/workspace-membership", async (Guid tenantId, SetTenantWorkspaceMembershipCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = tenantId }, ct)));
        platform.MapPut("/{tenantId:guid}/members/{userId:guid}", async (Guid tenantId, Guid userId, UpdateTenantMemberProfileCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = tenantId, UserId = userId, AppKey = null }, ct)));
        platform.MapGet("/{tenantId:guid}/applications/{appKey}/members", async (Guid tenantId, string appKey, int? page, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetTenantMembersQuery(tenantId, appKey, page ?? 1), ct)));
        platform.MapPut("/{tenantId:guid}/applications/{appKey}/members", async (Guid tenantId, string appKey, SetTenantMembershipCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = tenantId, AppKey = appKey }, ct)));
        platform.MapPut("/{tenantId:guid}/applications/{appKey}/members/{userId:guid}", async (Guid tenantId, string appKey, Guid userId, UpdateTenantMemberProfileCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = tenantId, AppKey = appKey, UserId = userId }, ct)));
        platform.MapDelete("/{tenantId:guid}/applications/{appKey}/members/{userId:guid}", async (Guid tenantId, string appKey, Guid userId, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new RemoveTenantMemberCommand(tenantId, appKey, userId), ct)));

        platform.MapPost("/{tenantId:guid}/applications/{appKey}/members", async (Guid tenantId, string appKey, CreateTenantMemberCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = tenantId, AppKey = appKey }, ct), 201));
        app.MapGet("/api/v1/auth/registration", async (ISender sender, CancellationToken ct) => Respond(await sender.Send(new GetRegistrationQuery(), ct)));
        app.MapPut("/api/v1/auth/registration", async (ConfigureRegistrationCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request, ct))).RequireAuthorization("Admin");

        var members = app.MapGroup("/api/v1/members").RequireAuthorization("Admin");
        members.MapGet("", async (int? page, ITenantContext scope, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetTenantMembersQuery(scope.TenantId ?? Guid.Empty, scope.AppKey ?? "", page ?? 1), ct)));
        members.MapPost("", async (CreateTenantMemberCommand request, ITenantContext scope, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = scope.TenantId ?? Guid.Empty, AppKey = scope.AppKey ?? "" }, ct), 201));
        members.MapPut("", async (SetTenantMembershipCommand request, ITenantContext scope, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { TenantId = scope.TenantId ?? Guid.Empty, AppKey = scope.AppKey ?? "" }, ct)));
    }
    #endregion

    private static IResult Respond<T>(Result<T> result, int status = 200) => result.IsSuccess ? Results.Json(result, statusCode: status)
        : Results.Json(new { error = result.Error }, statusCode: result.Error.Code.EndsWith("Forbidden", StringComparison.Ordinal) ? 403
            : result.Error.Code.EndsWith("NotFound", StringComparison.Ordinal) ? 404 : result.Error.Code.EndsWith("Conflict", StringComparison.Ordinal) ? 409 : 400);
}
