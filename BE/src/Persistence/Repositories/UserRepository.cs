namespace OnePortal.Persistence.Repositories;

using OnePortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using OnePortal.Domain.Repositories;
using OnePortal.Persistence.Repositories.Tenancy;

public sealed class UserRepository : RepositoryBase<User, Guid>, IUserRepository
{
    public UserRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet.FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), cancellationToken);
    }

    public async Task<User?> GetActiveByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var roles = DbContext.ApplicationRoles(DbContext.CurrentAppKey, DbContext.CurrentTenantId);
        return await DbSet.AsNoTracking()
            .FirstOrDefaultAsync(user => user.Id == id && user.IsActive && !user.IsDeleted
                && (DbContext.CurrentTenantId == Guid.Empty || roles.Any(membership => membership.UserId == user.Id && membership.IsActive)), cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(u => u.Email == email.ToLowerInvariant(), cancellationToken);
    }

    public Task<bool> AllowsSelfRegistrationAsync(Guid tenantId, string appKey, CancellationToken cancellationToken = default) =>
        DbContext.TenantApplications.AnyAsync(application => application.TenantId == tenantId && application.AppKey == appKey
            && application.IsEnabled && application.AllowSelfRegistration && application.ProvisioningStatus == "Ready", cancellationToken);

    public void AddMembership(OnePortal.Domain.Entities.Tenancy.TenantMembership membership) => DbContext.TenantMemberships.Add(membership);
}
