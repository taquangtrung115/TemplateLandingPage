namespace OnePortal.Domain.Repositories;

using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;

public interface IProductRepository : IRepositoryBase<Product, Guid>
{
    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<List<Product>> GetVisibleAsync(bool includeInactive, CancellationToken cancellationToken = default);
    Task<Product?> GetVisibleByIdAsync(Guid id, bool includeInactive, CancellationToken cancellationToken = default);
}
