namespace OnePortal.Domain.Repositories;

using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;

public interface INavigationMenuRepository : IRepositoryBase<NavigationMenu, Guid>
{
    Task<List<NavigationMenu>> GetTreeAsync(bool? isActiveOnly = null, CancellationToken cancellationToken = default);
    Task<NavigationMenu?> GetVisibleByIdAsync(Guid id, bool includeInactive, CancellationToken cancellationToken = default);
    Task<bool> HasChildrenAsync(Guid id, CancellationToken cancellationToken = default);
}
