namespace OnePortal.Persistence.Repositories.Tenancy;

using OnePortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using OnePortal.Application.Abstractions;
using OnePortal.Application.Services.Tenancy;
using OnePortal.Contract.Services.V1.Tenancy;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Domain.Entities.Tenancy;
using OnePortal.Persistence.Initialization;

public sealed partial class TenantStore(ApplicationDbContext database) : ITenantStore
{
    #region Queries
    public async Task<IReadOnlyList<TenantDto>> SearchAsync(int page, int pageSize, CancellationToken cancellationToken, string? search = null)
    {
        var query = database.Tenants.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(tenant => tenant.Name.ToLower().Contains(search.ToLower()) || tenant.Key.Contains(search.ToLower()));
        var tenants = await query.OrderBy(tenant => tenant.Key).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return await DescribeAsync(tenants, cancellationToken);
    }

    public Task<WorkspaceApplicationsDto?> GetWorkspaceApplicationsAsync(string tenantKey, CancellationToken cancellationToken) =>
        database.Tenants.AsNoTracking()
            .Where(tenant => tenant.Key == tenantKey && tenant.IsActive)
            .Select(tenant => new WorkspaceApplicationsDto(tenant.Name, database.TenantApplications
                .IgnoreQueryFilters().AsNoTracking()
                .Where(application => application.TenantId == tenant.Id && application.IsEnabled && application.ProvisioningStatus == "Ready")
                .OrderBy(application => application.AppKey)
                .Select(application => application.AppKey).ToArray()))
            .SingleOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<TenantContextDto>> GetContextsAsync(Guid userId, string appKey, int page, int pageSize, CancellationToken cancellationToken) =>
        await (from membership in database.ApplicationRoles(appKey)
               join tenant in database.Tenants on membership.TenantId equals tenant.Id
               join application in database.TenantApplications.IgnoreQueryFilters().AsNoTracking().Where(row => row.AppKey == appKey) on membership.TenantId equals application.TenantId
               where membership.UserId == userId && membership.IsActive && tenant.IsActive
                   && application.IsEnabled && application.ProvisioningStatus == "Ready"
               orderby tenant.Name, tenant.Id
               select new TenantContextDto(tenant.Id, tenant.Key, tenant.Name, appKey, membership.Role))
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<TenantMemberDto>> GetMembersAsync(Guid tenantId, string appKey, int page, int pageSize, CancellationToken cancellationToken) =>
        await (from membership in database.ApplicationRoles(appKey, tenantId)
               join user in database.Users on membership.UserId equals user.Id
               orderby user.Email, user.Id
               select new TenantMemberDto(user.Id, user.Email, user.FullName, membership.Role, membership.IsActive, user.IsActive))
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

    public async Task<RegistrationSettingsDto?> GetRegistrationAsync(Guid tenantId, string appKey, CancellationToken cancellationToken) =>
        await (from application in database.TenantApplications.IgnoreQueryFilters().AsNoTracking()
               join tenant in database.Tenants.AsNoTracking() on application.TenantId equals tenant.Id
               where application.TenantId == tenantId && application.AppKey == appKey && tenant.IsActive && application.IsEnabled && application.ProvisioningStatus == "Ready"
               select new RegistrationSettingsDto(tenant.Name, appKey, application.AllowSelfRegistration)).SingleOrDefaultAsync(cancellationToken);

    private async Task<IReadOnlyList<TenantDto>> DescribeAsync(IReadOnlyList<Tenant> tenants, CancellationToken cancellationToken)
    {
        if (tenants.Count == 0) return [];
        var ids = tenants.Select(tenant => tenant.Id).ToList();
        var applications = await database.TenantApplications.IgnoreQueryFilters().AsNoTracking().Where(application => ids.Contains(application.TenantId)).ToListAsync(cancellationToken);
        var lookup = applications.ToLookup(application => application.TenantId);
        var members = database.TenantMemberships.IgnoreQueryFilters().AsNoTracking().Where(member => ids.Contains(member.TenantId) && member.IsActive)
            .Select(member => new { member.TenantId, member.UserId })
            .Union(database.TenantWorkspaceMemberships.IgnoreQueryFilters().AsNoTracking().Where(member => ids.Contains(member.TenantId))
                .Select(member => new { member.TenantId, member.UserId }));
        var activeMembers = await (from member in members
                                   join user in database.Users.AsNoTracking() on member.UserId equals user.Id
                                   where user.IsActive
                                   group member by member.TenantId into company
                                   select new { company.Key, Count = company.Select(member => member.UserId).Distinct().Count() })
            .ToDictionaryAsync(company => company.Key, company => company.Count, cancellationToken);
        return tenants.Select(tenant => new TenantDto(tenant.Id, tenant.Key, tenant.Name, tenant.IsActive,
            lookup[tenant.Id].OrderBy(application => application.AppKey).Select(application => new TenantApplicationDto(application.AppKey, application.IsEnabled,
                application.AllowSelfRegistration, application.ProvisioningStatus, application.SeedVersion, application.LastInitializationError)).ToArray(),
            activeMembers.GetValueOrDefault(tenant.Id))).ToArray();
    }

    private async Task<TenantDto> DescribeAsync(Guid tenantId, CancellationToken cancellationToken) =>
        (await DescribeAsync(await database.Tenants.AsNoTracking().Where(tenant => tenant.Id == tenantId).ToListAsync(cancellationToken), cancellationToken)).Single();
    #endregion

    #region Commands
    public async Task<Result<TenantDto>> CreateAsync(string key, string name, string[] applications, string? adminEmail, CancellationToken cancellationToken)
    {
        if (await database.Tenants.AnyAsync(tenant => tenant.Key == key, cancellationToken)) return Result.Failure<TenantDto>(TenancyErrors.Conflict);
        Guid? adminId = null;
        if (!string.IsNullOrWhiteSpace(adminEmail))
        {
            var email = adminEmail.Trim().ToLowerInvariant();
            adminId = await database.Users.Where(user => user.Email == email && user.IsActive).Select(user => (Guid?)user.Id).SingleOrDefaultAsync(cancellationToken);
            if (!adminId.HasValue) return Result.Failure<TenantDto>(TenancyErrors.NotFound);
        }
        var tenant = Tenant.Create(key, name);
        database.Tenants.Add(tenant);
        try { await database.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateException error) when (error.InnerException is PostgresException { SqlState: "23505" })
        { return Result.Failure<TenantDto>(TenancyErrors.Conflict); }
        foreach (var appKey in applications)
        {
            await using var scoped = NewScope(tenant.Id, appKey);
            scoped.TenantApplications.Add(TenantApplication.Create(tenant.Id, appKey));
            if (adminId.HasValue) scoped.TenantMemberships.Add(TenantMembership.Create(tenant.Id, adminId.Value, appKey, "Admin"));
            await scoped.SaveChangesAsync(cancellationToken);
            await DatabaseInitializer.ProvisionAsync(scoped, cancellationToken);
        }
        return Result.Success(await DescribeAsync(tenant.Id, cancellationToken));
    }

    public async Task<Result<TenantDto>> UpdateAsync(Guid tenantId, string name, bool isActive, CancellationToken cancellationToken)
    {
        var tenant = await database.Tenants.SingleOrDefaultAsync(tenant => tenant.Id == tenantId, cancellationToken);
        if (tenant is null) return Result.Failure<TenantDto>(TenancyErrors.NotFound);
        tenant.Update(name, isActive); await database.SaveChangesAsync(cancellationToken);
        return Result.Success(await DescribeAsync(tenantId, cancellationToken));
    }

    public async Task<Result<TenantDto>> ConfigureApplicationAsync(Guid tenantId, string appKey, bool isEnabled, bool allowSelfRegistration, CancellationToken cancellationToken)
    {
        await using var scoped = NewScope(tenantId, appKey);
        var configured = await scoped.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            scoped.ChangeTracker.Clear();
            await using var transaction = await scoped.Database.BeginTransactionAsync(cancellationToken);
            await LockApplicationAsync(scoped, tenantId, appKey, cancellationToken);
            if (!await scoped.Tenants.AnyAsync(tenant => tenant.Id == tenantId, cancellationToken)) return false;
            var application = await scoped.TenantApplications.SingleOrDefaultAsync(application => application.AppKey == appKey, cancellationToken);
            if (application is null) { application = TenantApplication.Create(tenantId, appKey); scoped.TenantApplications.Add(application); }
            application.Configure(isEnabled, allowSelfRegistration);
            await scoped.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return true;
        });
        if (!configured) return Result.Failure<TenantDto>(TenancyErrors.NotFound);
        if (isEnabled) await DatabaseInitializer.ProvisionAsync(scoped, cancellationToken);
        var tenant = await GetDetailAsync(tenantId, null, cancellationToken);
        return tenant is null ? Result.Failure<TenantDto>(TenancyErrors.NotFound) : Result.Success(tenant);
    }

    public async Task<Result<TenantMemberDto>> SetMembershipAsync(Guid tenantId, string appKey, string email, string role, bool isActive, CancellationToken cancellationToken)
    {
        email = email.Trim().ToLowerInvariant();
        var user = await database.Users.AsNoTracking().SingleOrDefaultAsync(user => user.Email == email, cancellationToken);
        if (user is null) return Result.Failure<TenantMemberDto>(TenancyErrors.NotFound);
        await using var scoped = NewScope(tenantId, appKey);
        return await scoped.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            scoped.ChangeTracker.Clear();
            await using var transaction = await scoped.Database.BeginTransactionAsync(cancellationToken);
            await LockApplicationAsync(scoped, tenantId, appKey, cancellationToken);
            if (!await scoped.TenantApplications.AnyAsync(application => application.AppKey == appKey && application.IsEnabled, cancellationToken))
                return Result.Failure<TenantMemberDto>(TenancyErrors.NotFound);
            var membership = await scoped.TenantMemberships.SingleOrDefaultAsync(membership => membership.AppKey == appKey && membership.UserId == user.Id, cancellationToken);
            var wasAdmin = membership is null
                ? await scoped.TenantWorkspaceMemberships.AnyAsync(entry => entry.UserId == user.Id && entry.Role == "Admin", cancellationToken)
                : membership is { IsActive: true, Role: "Admin" };
            if (user.IsActive && wasAdmin && (!isActive || role != "Admin")
                && !await HasOtherAdminAsync(scoped, tenantId, appKey, user.Id, cancellationToken))
                return Result.Failure<TenantMemberDto>(TenancyErrors.LastAdmin);
            if (membership is null) { membership = TenantMembership.Create(tenantId, user.Id, appKey, role); scoped.TenantMemberships.Add(membership); }
            membership.Update(role, isActive);
            await scoped.SaveChangesAsync(cancellationToken); await transaction.CommitAsync(cancellationToken);
            return Result.Success(new TenantMemberDto(user.Id, user.Email, user.FullName, membership.Role, membership.IsActive, user.IsActive));
        });
    }

    public async Task<Result<RegistrationSettingsDto>> ConfigureRegistrationAsync(Guid tenantId, string appKey, bool allowSelfRegistration, CancellationToken cancellationToken)
    {
        await using var scoped = NewScope(tenantId, appKey);
        var application = await scoped.TenantApplications.SingleOrDefaultAsync(application => application.AppKey == appKey && application.IsEnabled && application.ProvisioningStatus == "Ready", cancellationToken);
        var tenantName = await scoped.Tenants.AsNoTracking().Where(tenant => tenant.Id == tenantId && tenant.IsActive).Select(tenant => tenant.Name).SingleOrDefaultAsync(cancellationToken);
        if (application is null || tenantName is null) return Result.Failure<RegistrationSettingsDto>(TenancyErrors.NotFound);
        application.Configure(application.IsEnabled, allowSelfRegistration);
        await scoped.SaveChangesAsync(cancellationToken);
        return Result.Success(new RegistrationSettingsDto(tenantName, appKey, allowSelfRegistration));
    }

    public async Task<Result<TenantMemberDto>> CreateMemberAsync(Guid tenantId, string appKey, string email, string fullName, string passwordHash, string role, CancellationToken cancellationToken)
    {
        await using var scoped = NewScope(tenantId, appKey);
        if (!await scoped.Tenants.AnyAsync(tenant => tenant.Id == tenantId && tenant.IsActive, cancellationToken)
            || !await scoped.TenantApplications.AnyAsync(application => application.AppKey == appKey && application.IsEnabled && application.ProvisioningStatus == "Ready", cancellationToken))
            return Result.Failure<TenantMemberDto>(TenancyErrors.NotFound);
        if (await scoped.Users.IgnoreQueryFilters().AnyAsync(user => user.Email == email, cancellationToken))
            return Result.Failure<TenantMemberDto>(new Error("Tenancy.AccountConflict", "Email đã có tài khoản. Hãy chọn Tài khoản đã có để cấp quyền."));
        var user = User.Create(email, passwordHash, fullName, "User");
        scoped.Users.Add(user);
        scoped.TenantMemberships.Add(TenantMembership.Create(tenantId, user.Id, appKey, role));
        try { await scoped.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateException error) when (error.InnerException is PostgresException { SqlState: "23505" })
        { return Result.Failure<TenantMemberDto>(new Error("Tenancy.AccountConflict", "Email đã có tài khoản. Hãy chọn Tài khoản đã có để cấp quyền.")); }
        return Result.Success(new TenantMemberDto(user.Id, user.Email, user.FullName, role, true, true));
    }

    private ApplicationDbContext NewScope(Guid tenantId, string appKey) => new(database.GetOptions(), TenantContext.For(tenantId, appKey));
    #endregion
}
