namespace TemplateLandingPage.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

public sealed class CategoryRepository : RepositoryBase<Category, Guid>, ICategoryRepository
{
    private readonly ApplicationDbContext _context;

    public CategoryRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
        _context = dbContext;
    }

    public async Task<Category?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Templates)
            .FirstOrDefaultAsync(c => c.Slug == slug.ToLowerInvariant(), cancellationToken);
    }

    public async Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(c => c.Slug == slug.ToLowerInvariant(), cancellationToken);
    }

    public async Task<List<Category>> GetAllOrderedAsync(bool? isActiveOnly = null, CancellationToken cancellationToken = default)
    {
        IQueryable<Category> query = DbSet.Include(c => c.Templates);

        if (isActiveOnly.HasValue && isActiveOnly.Value)
        {
            query = query.Where(c => c.IsActive);
        }

        return await query
            .OrderBy(c => c.OrderIndex)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasAssociatedTemplatesAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _context.Templates.AnyAsync(t => t.CategoryId == categoryId && !t.IsDeleted, cancellationToken);
    }
}
