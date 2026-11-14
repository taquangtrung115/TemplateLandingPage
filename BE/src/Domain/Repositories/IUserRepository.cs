namespace OnePortal.Domain.Repositories;

using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;

public interface IUserRepository : IRepositoryBase<User, Guid>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetActiveByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> AllowsSelfRegistrationAsync(Guid tenantId, string appKey, CancellationToken cancellationToken = default);
    void AddMembership(OnePortal.Domain.Entities.Tenancy.TenantMembership membership);
}
