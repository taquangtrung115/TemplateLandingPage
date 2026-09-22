namespace TemplateLandingPage.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

public sealed class TemplateRepository : RepositoryBase<Template, Guid>, ITemplateRepository
{
    public TemplateRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<Template?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.CategoryRef)
            .FirstOrDefaultAsync(t => t.Slug == slug.ToLowerInvariant(), cancellationToken);
    }

    public async Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(t => t.Slug == slug.ToLowerInvariant(), cancellationToken);
    }

    public async Task<List<Template>> GetListAsync(
        string? category = null,
        Guid? categoryId = null,
        string? badge = null,
        string? search = null,
        bool? isActiveOnly = null,
        bool? isCommunity = null,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Template> query = DbSet.Include(t => t.CategoryRef);

        if (categoryId.HasValue)
        {
            query = query.Where(t => t.CategoryId == categoryId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(category) && !category.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(t => t.Category.ToLower() == category.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(badge) && !badge.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(t => t.Badge != null && t.Badge.ToLower() == badge.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(searchLower) || (t.Description != null && t.Description.ToLower().Contains(searchLower)));
        }

        if (isActiveOnly.HasValue && isActiveOnly.Value)
        {
            query = query.Where(t => t.IsActive);
        }

        if (isCommunity.HasValue)
        {
            query = query.Where(t => t.IsCommunity == isCommunity.Value);
        }

        return await query
            .OrderByDescending(t => t.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }
}
