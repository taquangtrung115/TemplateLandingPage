namespace TemplateLandingPage.Domain.Repositories;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;

public interface INavigationMenuRepository : IRepositoryBase<NavigationMenu, Guid>
{
    Task<List<NavigationMenu>> GetTreeAsync(bool? isActiveOnly = null, CancellationToken cancellationToken = default);
    Task<NavigationMenu?> GetVisibleByIdAsync(Guid id, bool includeInactive, CancellationToken cancellationToken = default);
    Task<bool> HasChildrenAsync(Guid id, CancellationToken cancellationToken = default);
}
