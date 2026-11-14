namespace OnePortal.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Repositories;
using OnePortal.Domain.ReadModels;

public sealed class TemplateRepository : RepositoryBase<Template, Guid>, ITemplateRepository
{
    public TemplateRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<Template?> GetBySlugAsync(string slug, bool includeInactive, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking()
            .Where(t => !t.IsDeleted && t.Slug == slug.ToLowerInvariant());

        if (!includeInactive)
        {
            query = query.Where(t => t.IsActive);
        }

        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public Task<Template?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default) =>
        GetBySlugAsync(slug, true, cancellationToken);

    public async Task<Template?> GetVisibleByIdAsync(Guid id, bool includeInactive, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking()
            .Where(t => t.Id == id && !t.IsDeleted);

        if (!includeInactive)
        {
            query = query.Where(t => t.IsActive);
        }

        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public Task<string?> GetNameByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return DbSet.AsNoTracking()
            .Where(template => template.Id == id && !template.IsDeleted)
            .Select(template => template.Name)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(t => t.Slug == slug.ToLowerInvariant(), cancellationToken);
    }

    public async Task<List<TemplateSummary>> GetListAsync(
        string? category = null,
        Guid? categoryId = null,
        string? badge = null,
        string? search = null,
        bool? isActiveOnly = null,
        bool? isCommunity = null,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Template> query = DbSet.AsNoTracking().Where(t => !t.IsDeleted);

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
            .Select(t => new TemplateSummary(
                t.Id,
                t.Name,
                t.Slug,
                t.Description,
                t.CategoryId,
                t.Category,
                t.ThumbnailUrl,
                t.PreviewUrl,
                t.LongPreviewUrl,
                t.Badge,
                t.AudioUrl,
                t.MusicTitle,
                t.IsActive,
                t.IsCommunity,
                t.AuthorName,
                t.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }
}
