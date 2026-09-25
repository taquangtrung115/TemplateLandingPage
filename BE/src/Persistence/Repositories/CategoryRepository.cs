namespace TemplateLandingPage.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using TemplateLandingPage.Domain.ReadModels;

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
        return await DbSet.AsNoTracking()
            .FirstOrDefaultAsync(c => !c.IsDeleted && c.Slug == slug.ToLowerInvariant(), cancellationToken);
    }

    public async Task<Category?> GetActiveByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id && c.IsActive && !c.IsDeleted, cancellationToken);
    }

    public async Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(c => c.Slug == slug.ToLowerInvariant(), cancellationToken);
    }

    public async Task<List<CategorySummary>> GetSummariesAsync(bool includeInactive, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(category => !category.IsDeleted);
        if (!includeInactive)
        {
            query = query.Where(category => category.IsActive);
        }

        return await query
            .OrderBy(category => category.OrderIndex)
            .ThenBy(category => category.Name)
            .Select(category => new CategorySummary(
                category.Id,
                category.Name,
                category.Slug,
                category.Description,
                category.Icon,
                category.OrderIndex,
                category.IsActive,
                category.Templates.Count(template => !template.IsDeleted && (includeInactive || template.IsActive)),
                category.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<CategorySummary?> GetSummaryByIdAsync(Guid id, bool includeInactive, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(category => category.Id == id && !category.IsDeleted);
        if (!includeInactive)
        {
            query = query.Where(category => category.IsActive);
        }

        return await ProjectSummary(query, includeInactive).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<CategorySummary?> GetSummaryBySlugAsync(string slug, bool includeInactive, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(category => category.Slug == slug.ToLowerInvariant() && !category.IsDeleted);
        if (!includeInactive)
        {
            query = query.Where(category => category.IsActive);
        }

        return await ProjectSummary(query, includeInactive).FirstOrDefaultAsync(cancellationToken);
    }

    private static IQueryable<CategorySummary> ProjectSummary(IQueryable<Category> query, bool includeInactive) =>
        query.Select(category => new CategorySummary(
            category.Id,
            category.Name,
            category.Slug,
            category.Description,
            category.Icon,
            category.OrderIndex,
            category.IsActive,
            category.Templates.Count(template => !template.IsDeleted && (includeInactive || template.IsActive)),
            category.CreatedAtUtc));

    public async Task<bool> HasAssociatedTemplatesAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _context.Templates.AnyAsync(t => t.CategoryId == categoryId && !t.IsDeleted, cancellationToken);
    }
}
