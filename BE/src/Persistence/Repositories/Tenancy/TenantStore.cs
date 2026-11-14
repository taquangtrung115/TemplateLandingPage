namespace OnePortal.Persistence.Repositories.Tenancy;

using Microsoft.EntityFrameworkCore;
using Npgsql;
using OnePortal.Application.Abstractions;
using OnePortal.Application.Services.Tenancy;
using OnePortal.Application.UseCases.V1.Tenancy.Dtos;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Domain.Entities.Tenancy;
using OnePortal.Domain.Entities;
using OnePortal.Persistence.Initialization;

public sealed class TenantStore(ApplicationDbContext database) : ITenantStore
{
    #region Queries
    public async Task<IReadOnlyList<TenantDto>> SearchAsync(int page, int pageSize, CancellationToken cancellationToken, string? search = null)
    {
        var query = database.Tenants.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(tenant => tenant.Name.ToLower().Contains(search.ToLower()) || tenant.Key.Contains(search.ToLower()));
        var tenants = await query.OrderBy(tenant => tenant.Key).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return await DescribeAsync(tenants, cancellationToken);
    }

    public async Task<IReadOnlyList<TenantContextDto>> GetContextsAsync(Guid userId, string appKey, int page, int pageSize, CancellationToken cancellationToken) =>
        await (from membership in database.TenantMemberships.IgnoreQueryFilters().AsNoTracking()
               join tenant in database.Tenants on membership.TenantId equals tenant.Id
               join application in database.TenantApplications.IgnoreQueryFilters() on new { membership.TenantId, membership.AppKey } equals new { application.TenantId, application.AppKey }
               where membership.UserId == userId && membership.AppKey == appKey && membership.IsActive && tenant.IsActive
                   && application.IsEnabled && application.ProvisioningStatus == "Ready"
               orderby tenant.Name, tenant.Id
               select new TenantContextDto(tenant.Id, tenant.Key, tenant.Name, membership.AppKey, membership.Role))
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<TenantMemberDto>> GetMembersAsync(Guid tenantId, string appKey, int page, int pageSize, CancellationToken cancellationToken) =>
        await (from membership in database.TenantMemberships.IgnoreQueryFilters().AsNoTracking()
               join user in database.Users on membership.UserId equals user.Id
               where membership.TenantId == tenantId && membership.AppKey == appKey
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
        var ids = tenants.Select(tenant => tenant.Id).ToList();
        var applications = await database.TenantApplications.IgnoreQueryFilters().AsNoTracking().Where(application => ids.Contains(application.TenantId)).ToListAsync(cancellationToken);
        var lookup = applications.ToLookup(application => application.TenantId);
        return tenants.Select(tenant => new TenantDto(tenant.Id, tenant.Key, tenant.Name, tenant.IsActive,
            lookup[tenant.Id].OrderBy(application => application.AppKey).Select(application => new TenantApplicationDto(application.AppKey, application.IsEnabled,
                application.AllowSelfRegistration, application.ProvisioningStatus, application.SeedVersion, application.LastInitializationError)).ToArray())).ToArray();
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
        if (!await database.Tenants.AnyAsync(tenant => tenant.Id == tenantId, cancellationToken)) return Result.Failure<TenantDto>(TenancyErrors.NotFound);
        await using var scoped = NewScope(tenantId, appKey);
        var application = await scoped.TenantApplications.SingleOrDefaultAsync(application => application.AppKey == appKey, cancellationToken);
        if (application is null) { application = TenantApplication.Create(tenantId, appKey); scoped.TenantApplications.Add(application); }
        application.Configure(isEnabled, allowSelfRegistration);
        await scoped.SaveChangesAsync(cancellationToken);
        if (isEnabled) await DatabaseInitializer.ProvisionAsync(scoped, cancellationToken);
        return Result.Success(await DescribeAsync(tenantId, cancellationToken));
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
            await scoped.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({tenantId.ToString() + ":" + appKey}, 0))", cancellationToken);
            if (!await scoped.TenantApplications.AnyAsync(application => application.AppKey == appKey, cancellationToken)) return Result.Failure<TenantMemberDto>(TenancyErrors.NotFound);
            var membership = await scoped.TenantMemberships.SingleOrDefaultAsync(membership => membership.AppKey == appKey && membership.UserId == user.Id, cancellationToken);
            if (membership is { IsActive: true, Role: "Admin" } && (!isActive || role != "Admin")
                && !await scoped.TenantMemberships.AnyAsync(other => other.AppKey == appKey && other.IsActive && other.Role == "Admin" && other.UserId != user.Id && scoped.Users.Any(account => account.Id == other.UserId && account.IsActive), cancellationToken))
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
