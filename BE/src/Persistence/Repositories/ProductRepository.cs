namespace TemplateLandingPage.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

public sealed class ProductRepository : RepositoryBase<Product, Guid>, IProductRepository
{
    public ProductRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(p => p.Name.ToLower() == name.ToLower(), cancellationToken);
    }

    public async Task<List<Product>> GetVisibleAsync(bool includeInactive, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(product => !product.IsDeleted);
        if (!includeInactive)
        {
            query = query.Where(product => product.IsActive);
        }

        return await query.OrderBy(product => product.Name).ToListAsync(cancellationToken);
    }

    public async Task<Product?> GetVisibleByIdAsync(Guid id, bool includeInactive, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(product => product.Id == id && !product.IsDeleted);
        if (!includeInactive)
        {
            query = query.Where(product => product.IsActive);
        }

        return await query.FirstOrDefaultAsync(cancellationToken);
    }
}
