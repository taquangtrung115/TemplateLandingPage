namespace OnePortal.Persistence.Repositories.Tenancy;

using Microsoft.EntityFrameworkCore;
using Npgsql;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Tenancy;
using OnePortal.Domain.Entities.Tenancy;
using OnePortal.Domain.Entities.Users;

public sealed partial class TenantStore
{
    #region Platform queries
    public async Task<TenantDto?> GetDetailAsync(Guid? tenantId, string? tenantKey, CancellationToken cancellationToken)
    {
        var tenants = await database.Tenants.AsNoTracking().Where(row => tenantId.HasValue ? row.Id == tenantId : row.Key == tenantKey)
            .ToListAsync(cancellationToken);
        return (await DescribeAsync(tenants, cancellationToken)).SingleOrDefault();
    }

    public async Task<Result<GetTenantUsersResult>> GetTenantUsersAsync(Guid tenantId, string? search, int page, int pageSize, CancellationToken cancellationToken)
    {
        if (!await database.Tenants.AsNoTracking().AnyAsync(row => row.Id == tenantId, cancellationToken))
            return Result.Failure<GetTenantUsersResult>(TenancyErrors.NotFound);

        var workspaceRoles = database.TenantWorkspaceMemberships.IgnoreQueryFilters().AsNoTracking().Where(row => row.TenantId == tenantId);
        var appRoles = database.TenantMemberships.IgnoreQueryFilters().AsNoTracking().Where(row => row.TenantId == tenantId);
        var ids = workspaceRoles.Select(row => row.UserId).Union(appRoles.Select(row => row.UserId));
        var accounts = database.Users.AsNoTracking().Where(row => ids.Contains(row.Id));
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            accounts = accounts.Where(row => row.FullName.ToLower().Contains(term) || row.Email.Contains(term));
        }
        var totalCount = await accounts.CountAsync(cancellationToken);
        var users = await accounts.OrderBy(row => row.Email).ThenBy(row => row.Id).Skip((page - 1) * pageSize).Take(pageSize)
            .Select(row => new { row.Id, row.Email, row.FullName, row.IsActive, WorkspaceRole = workspaceRoles.Where(role => role.UserId == row.Id).Select(role => role.Role).FirstOrDefault() })
            .ToListAsync(cancellationToken);
        if (users.Count == 0) return Result.Success(new GetTenantUsersResult([], totalCount, page, pageSize));
        var userIds = users.Select(user => user.Id).ToList();
        var memberships = await appRoles.Where(row => userIds.Contains(row.UserId))
            .Select(row => new { row.UserId, row.AppKey, row.Role, row.IsActive }).ToListAsync(cancellationToken);
        var byAccount = memberships.ToLookup(row => row.UserId);
        var items = users.Select(user => new TenantUserDto(user.Id, user.Email, user.FullName, user.IsActive, user.WorkspaceRole,
            byAccount[user.Id].Select(row => new TenantUserAppRoleDto(row.AppKey, row.Role, row.IsActive)).ToArray())).ToArray();
        return Result.Success(new GetTenantUsersResult(items, totalCount, page, pageSize));
    }
    #endregion

    #region Platform membership commands
    public async Task<Result<bool>> SetWorkspaceMembershipAsync(Guid tenantId, string email, string? role, string? fullName, string? passwordHash, CancellationToken cancellationToken)
    {
        await using var scoped = NewScope(tenantId, "landing");
        return await scoped.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            scoped.ChangeTracker.Clear();
            await using var transaction = await scoped.Database.BeginTransactionAsync(cancellationToken);
            await LockAllApplicationsAsync(scoped, tenantId, cancellationToken);
            if (!await scoped.Tenants.AnyAsync(row => row.Id == tenantId, cancellationToken)) return Result.Failure<bool>(TenancyErrors.NotFound);
            var user = await scoped.Users.AsNoTracking().SingleOrDefaultAsync(row => row.Email == email, cancellationToken);
            if (passwordHash is not null && user is not null)
                return Result.Failure<bool>(new Error("Tenancy.AccountConflict", "Email đã có tài khoản. Hãy chọn Tài khoản đã có để cấp quyền."));
            if (user is null)
            {
                if (passwordHash is null) return Result.Failure<bool>(TenancyErrors.NotFound);
                user = User.Create(email, passwordHash, fullName!, "User");
                scoped.Users.Add(user);
            }
            var workspaceRole = await scoped.TenantWorkspaceMemberships.SingleOrDefaultAsync(row => row.UserId == user.Id, cancellationToken);
            if (user.IsActive && workspaceRole?.Role == "Admin" && role != "Admin"
                && await IsLastInheritedAdminAsync(scoped, tenantId, user.Id, cancellationToken))
                return Result.Failure<bool>(TenancyErrors.LastAdmin);

            if (workspaceRole is null && role is not null) scoped.TenantWorkspaceMemberships.Add(TenantWorkspaceMembership.Create(tenantId, user.Id, role));
            else if (workspaceRole is not null && role is null) scoped.TenantWorkspaceMemberships.Remove(workspaceRole);
            else if (role is not null) workspaceRole?.SetRole(role);

            try { await scoped.SaveChangesAsync(cancellationToken); }
            catch (DbUpdateException error) when (error.InnerException is PostgresException { SqlState: "23505" })
            { return Result.Failure<bool>(TenancyErrors.Conflict); }
            await transaction.CommitAsync(cancellationToken);
            return Result.Success(true);
        });
    }

    public async Task<Result<bool>> RemoveMembershipAsync(Guid tenantId, string appKey, Guid userId, CancellationToken cancellationToken)
    {
        await using var scoped = NewScope(tenantId, appKey);
        return await scoped.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            scoped.ChangeTracker.Clear();
            await using var transaction = await scoped.Database.BeginTransactionAsync(cancellationToken);
            await LockApplicationAsync(scoped, tenantId, appKey, cancellationToken);
            var member = await scoped.TenantMemberships.SingleOrDefaultAsync(row => row.UserId == userId, cancellationToken);
            if (member is null) return Result.Failure<bool>(TenancyErrors.NotFound);
            if (member is { IsActive: true, Role: "Admin" }
                && await scoped.Users.AsNoTracking().AnyAsync(user => user.Id == userId && user.IsActive, cancellationToken)
                && !await scoped.TenantWorkspaceMemberships.AnyAsync(row => row.UserId == userId && row.Role == "Admin", cancellationToken)
                && !await HasOtherAdminAsync(scoped, tenantId, appKey, userId, cancellationToken))
                return Result.Failure<bool>(TenancyErrors.LastAdmin);
            scoped.TenantMemberships.Remove(member);
            await scoped.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return Result.Success(true);
        });
    }

    public async Task<Result<TenantMemberDto>> UpdateMemberProfileAsync(Guid tenantId, Guid userId, string fullName, string? passwordHash, CancellationToken cancellationToken, string? appKey = null)
    {
        await using var scoped = NewScope(tenantId, appKey ?? "landing");
        return await scoped.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            scoped.ChangeTracker.Clear();
            await using var transaction = await scoped.Database.BeginTransactionAsync(cancellationToken);
            await LockAllApplicationsAsync(scoped, tenantId, cancellationToken);
            var role = appKey is null
                ? await scoped.TenantWorkspaceMemberships.AsNoTracking().Where(row => row.UserId == userId).Select(row => row.Role).SingleOrDefaultAsync(cancellationToken)
                    ?? await scoped.TenantMemberships.IgnoreQueryFilters().AsNoTracking().Where(row => row.TenantId == tenantId && row.UserId == userId)
                        .OrderBy(row => row.AppKey).Select(row => row.Role).FirstOrDefaultAsync(cancellationToken)
                : await scoped.ApplicationRoles(appKey, tenantId).Where(row => row.UserId == userId).Select(row => row.Role).SingleOrDefaultAsync(cancellationToken);
            if (role is null) return Result.Failure<TenantMemberDto>(TenancyErrors.NotFound);
            var user = await scoped.Users.SingleOrDefaultAsync(row => row.Id == userId, cancellationToken);
            if (user is null) return Result.Failure<TenantMemberDto>(TenancyErrors.NotFound);
            if (passwordHash is not null && (user.IsPlatformAdmin || user.Provider is not (null or "Local")))
                return Result.Failure<TenantMemberDto>(new Error("Tenancy.InvalidPasswordReset", "Tài khoản này phải đổi mật khẩu qua phương thức đăng nhập hiện tại."));
            user.UpdateProfile(fullName, user.Role, user.IsActive);
            if (passwordHash is not null) user.ChangePassword(passwordHash);
            await scoped.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return Result.Success(new TenantMemberDto(user.Id, user.Email, user.FullName, role, true, user.IsActive));
        });
    }
    #endregion

    #region Shared guards
    private static Task LockApplicationAsync(ApplicationDbContext context, Guid tenantId, string appKey, CancellationToken cancellationToken) =>
        context.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({tenantId.ToString() + ":" + appKey}, 0))", cancellationToken);

    private static async Task LockAllApplicationsAsync(ApplicationDbContext context, Guid tenantId, CancellationToken cancellationToken)
    {
        foreach (var appKey in TenantDefaults.ApplicationKeys.Order(StringComparer.Ordinal))
            await LockApplicationAsync(context, tenantId, appKey, cancellationToken);
    }

    private static Task<bool> HasOtherAdminAsync(ApplicationDbContext context, Guid tenantId, string appKey, Guid userId, CancellationToken cancellationToken) =>
        context.ApplicationRoles(appKey, tenantId).AnyAsync(row => row.UserId != userId && row.IsActive && row.Role == "Admin"
            && context.Users.Any(user => user.Id == row.UserId && user.IsActive), cancellationToken);

    private static Task<bool> IsLastInheritedAdminAsync(ApplicationDbContext context, Guid tenantId, Guid userId, CancellationToken cancellationToken)
    {
        var direct = context.TenantMemberships.IgnoreQueryFilters().Where(row => row.TenantId == tenantId);
        var inherited = context.TenantWorkspaceMemberships.Where(row => row.Role == "Admin" && row.UserId != userId && context.Users.Any(user => user.Id == row.UserId && user.IsActive));
        return context.TenantApplications.IgnoreQueryFilters().AnyAsync(app => app.TenantId == tenantId && app.IsEnabled
            && !direct.Any(row => row.AppKey == app.AppKey && row.UserId == userId)
            && !direct.Any(row => row.AppKey == app.AppKey && row.UserId != userId && row.Role == "Admin" && row.IsActive
                && context.Users.Any(user => user.Id == row.UserId && user.IsActive))
            && !inherited.Any(row => !direct.Any(overrideRow => overrideRow.AppKey == app.AppKey && overrideRow.UserId == row.UserId)), cancellationToken);
    }
    #endregion
}
