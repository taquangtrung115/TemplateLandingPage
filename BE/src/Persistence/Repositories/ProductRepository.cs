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
}
