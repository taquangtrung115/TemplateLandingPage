namespace TemplateLandingPage.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

public sealed class NavigationMenuRepository : RepositoryBase<NavigationMenu, Guid>, INavigationMenuRepository
{
    public NavigationMenuRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<List<NavigationMenu>> GetTreeAsync(bool? isActiveOnly = null, CancellationToken cancellationToken = default)
    {
        IQueryable<NavigationMenu> query = DbSet
            .Include(m => m.SubMenus)
            .Where(m => m.ParentId == null);

        if (isActiveOnly.HasValue && isActiveOnly.Value)
        {
            query = query.Where(m => m.IsActive);
        }

        var roots = await query
            .OrderBy(m => m.OrderIndex)
            .ThenBy(m => m.Title)
            .ToListAsync(cancellationToken);

        if (isActiveOnly.HasValue && isActiveOnly.Value)
        {
            foreach (var root in roots)
            {
                root.SubMenus = root.SubMenus.Where(s => s.IsActive && !s.IsDeleted).OrderBy(s => s.OrderIndex).ToList();
            }
        }
        else
        {
            foreach (var root in roots)
            {
                root.SubMenus = root.SubMenus.Where(s => !s.IsDeleted).OrderBy(s => s.OrderIndex).ToList();
            }
        }

        return roots;
    }

    public async Task<bool> HasChildrenAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(m => m.ParentId == id, cancellationToken);
    }
}
