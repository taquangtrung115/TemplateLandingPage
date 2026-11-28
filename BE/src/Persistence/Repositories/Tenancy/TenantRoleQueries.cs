namespace OnePortal.Persistence.Repositories.Tenancy;

using Microsoft.EntityFrameworkCore;

public static class TenantRoleQueries
{
    public sealed class ApplicationRole
    {
        public Guid TenantId { get; init; }
        public Guid UserId { get; init; }
        public string Role { get; init; } = string.Empty;
        public bool IsActive { get; init; }
    }

    public static IQueryable<ApplicationRole> ApplicationRoles(this ApplicationDbContext database, string appKey, Guid? tenantId = null)
    {
        var direct = database.TenantMemberships.IgnoreQueryFilters().AsNoTracking()
            .Where(row => row.AppKey == appKey && (!tenantId.HasValue || row.TenantId == tenantId));
        var inherited = database.TenantWorkspaceMemberships.IgnoreQueryFilters().AsNoTracking()
            .Where(row => (!tenantId.HasValue || row.TenantId == tenantId)
                && !direct.Any(application => application.TenantId == row.TenantId && application.UserId == row.UserId));
        var roles = direct.Select(row => new { row.TenantId, row.UserId, row.Role, row.IsActive })
            .Concat(inherited.Select(row => new { row.TenantId, row.UserId, row.Role, IsActive = true }));
        return roles.Select(row => new ApplicationRole { TenantId = row.TenantId, UserId = row.UserId, Role = row.Role, IsActive = row.IsActive });
    }
}
