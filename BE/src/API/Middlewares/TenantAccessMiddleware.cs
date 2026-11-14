namespace OnePortal.API.Middlewares;

using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using OnePortal.Application.Services.Tenancy;
using OnePortal.Persistence;

public sealed class TenantAccessMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, ApplicationDbContext database, TenantContext scope, RequestActor actor)
    {
        #region Resolve account and tenant independently from client headers
        Guid? userId = Guid.TryParse(context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? context.User.FindFirstValue("sub"), out var id) ? id : null;
        var identity = context.User.Identity as ClaimsIdentity;
        var authenticated = identity?.IsAuthenticated == true;
        if (identity is not null)
            foreach (var claim in identity.Claims.Where(claim => claim.Type is ClaimTypes.Role or "platform_admin").ToArray()) identity.RemoveClaim(claim);

        var platformAdmin = false;
        if (authenticated)
        {
            var account = await database.Users.AsNoTracking().Where(user => user.Id == userId && user.IsActive)
                .Select(user => new { user.Id, user.IsPlatformAdmin }).SingleOrDefaultAsync(context.RequestAborted);
            if (account is null) { await FailAsync(context, 401, "Auth.AccountUnavailable"); return; }
            platformAdmin = account.IsPlatformAdmin;
            if (platformAdmin) identity!.AddClaim(new Claim("platform_admin", "true"));
        }

        string? role = null;
        if (context.Items[TenantRoutingMiddleware.SelectionKey] is ValueTuple<string, string> selection)
        {
            var application = await (from tenant in database.Tenants.AsNoTracking()
                                     join app in database.TenantApplications.IgnoreQueryFilters().AsNoTracking() on tenant.Id equals app.TenantId
                                     where tenant.Key == selection.Item1 && app.AppKey == selection.Item2
                                     select new { TenantId = tenant.Id, tenant.IsActive, app.IsEnabled, app.ProvisioningStatus }).SingleOrDefaultAsync(context.RequestAborted);
            if (application is null) { await FailAsync(context, 404, "Tenancy.NotFound"); return; }
            if (!application.IsActive || !application.IsEnabled) { await FailAsync(context, 403, "Tenancy.Disabled"); return; }
            if (application.ProvisioningStatus != "Ready") { await FailAsync(context, 503, "Tenancy.Initializing"); return; }
            scope.Initialize(application.TenantId, selection.Item2, selection.Item1);
            if (authenticated)
            {
                role = await database.TenantMemberships.AsNoTracking().Where(membership => membership.UserId == userId && membership.AppKey == scope.AppKey && membership.IsActive)
                    .Select(membership => membership.Role).SingleOrDefaultAsync(context.RequestAborted);
                if (role is null && context.GetEndpoint()?.Metadata.GetOrderedMetadata<IAuthorizeData>().Count > 0)
                { await FailAsync(context, 403, "Tenancy.MembershipRequired"); return; }
                if (role is not null) identity!.AddClaim(new Claim(ClaimTypes.Role, role));
            }
        }
        if (authenticated) actor.Initialize(userId!.Value, platformAdmin, role);
        #endregion
        await next(context);
    }

    private static Task FailAsync(HttpContext context, int status, string code)
    {
        context.Response.StatusCode = status;
        return context.Response.WriteAsJsonAsync(new { error = new { code, message = status == 503 ? "Workspace đang được khởi tạo. Vui lòng thử lại." : "Không thể truy cập workspace hoặc tài khoản này." } }, context.RequestAborted);
    }
}
