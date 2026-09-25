namespace TemplateLandingPage.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using TemplateLandingPage.Domain.ReadModels;

public sealed class CustomizationRepository : RepositoryBase<UserCustomization, Guid>, ICustomizationRepository
{
    public CustomizationRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<UserCustomization?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var normalized = slug.Trim().ToLowerInvariant();
        return await DbSet.AsNoTracking().FirstOrDefaultAsync(c => c.Slug == normalized, cancellationToken);
    }

    public async Task<List<UserCustomization>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking().Where(c => c.UserId == userId).ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await FindSlugOwnerAsync(slug, cancellationToken) is not null;
    }

    public Task<UserCustomization?> ReadByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        DbSet.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public Task<CustomizationAccess?> ReadAccessAsync(Guid id, CancellationToken cancellationToken = default) =>
        DbSet.AsNoTracking().Where(c => c.Id == id)
            .Select(c => new CustomizationAccess(c.Id, c.UserId, c.Slug, c.PublishedVersionId))
            .FirstOrDefaultAsync(cancellationToken);

    public Task<UserCustomization?> GetByClientDraftIdAsync(Guid userId, Guid clientDraftId, CancellationToken cancellationToken = default) =>
        DbSet.IgnoreQueryFilters().AsNoTracking().FirstOrDefaultAsync(c => c.UserId == userId && c.ClientDraftId == clientDraftId, cancellationToken);

    public async Task<Guid?> FindSlugOwnerAsync(string slug, CancellationToken cancellationToken = default)
    {
        var normalized = slug.Trim().ToLowerInvariant();
        return await DbContext.Set<CustomizationSlugAlias>().AsNoTracking()
            .Where(a => a.Slug == normalized).Select(a => (Guid?)a.CustomizationId).FirstOrDefaultAsync(cancellationToken);
    }

    public void AddAlias(CustomizationSlugAlias alias) => DbContext.Set<CustomizationSlugAlias>().Add(alias);
    public void AddVersion(CustomizationVersion version) => DbContext.Set<CustomizationVersion>().Add(version);

    public Task<CustomizationVersion?> GetVersionAsync(Guid customizationId, Guid versionId, CancellationToken cancellationToken = default) =>
        DbContext.Set<CustomizationVersion>().FirstOrDefaultAsync(v => v.CustomizationId == customizationId && v.Id == versionId, cancellationToken);

    public Task<CustomizationVersion?> GetVersionByRequestAsync(Guid customizationId, Guid requestId, CancellationToken cancellationToken = default) =>
        DbContext.Set<CustomizationVersion>().AsNoTracking().FirstOrDefaultAsync(v => v.CustomizationId == customizationId && v.RequestId == requestId, cancellationToken);

    public Task<CustomizationVersion?> ReadVersionAsync(Guid customizationId, Guid versionId, CancellationToken cancellationToken = default) =>
        DbContext.Set<CustomizationVersion>().AsNoTracking().FirstOrDefaultAsync(v => v.CustomizationId == customizationId && v.Id == versionId, cancellationToken);

    public Task<PublishedCustomization?> GetPublicVersionAsync(Guid versionId, CancellationToken cancellationToken = default) =>
        (from version in DbContext.Set<CustomizationVersion>().AsNoTracking()
         join site in DbSet.AsNoTracking() on version.CustomizationId equals site.Id
         where version.IsPublic && version.Id == versionId
         select new PublishedCustomization(site.Id, version.Id, version.VersionNumber, site.TemplateId,
             version.Title, site.Slug, version.ConfigJson)).FirstOrDefaultAsync(cancellationToken);

    public async Task<PublishedCustomization?> GetPublicAsync(string slug, int? versionNumber, CancellationToken cancellationToken = default)
    {
        var normalized = slug.Trim().ToLowerInvariant();
        var query = from alias in DbContext.Set<CustomizationSlugAlias>().AsNoTracking()
                    join site in DbSet.AsNoTracking() on alias.CustomizationId equals site.Id
                    join version in DbContext.Set<CustomizationVersion>().AsNoTracking() on site.Id equals version.CustomizationId
                    where alias.Slug == normalized && version.IsPublic &&
                        (versionNumber.HasValue ? version.VersionNumber == versionNumber.Value : site.PublishedVersionId == version.Id)
                    select new PublishedCustomization(site.Id, version.Id, version.VersionNumber, site.TemplateId, version.Title, site.Slug, version.ConfigJson);
        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public Task<List<CustomizationVersion>> GetPublishedVersionsAsync(Guid customizationId, CancellationToken cancellationToken = default) =>
        DbContext.Set<CustomizationVersion>().Where(v => v.CustomizationId == customizationId && v.IsPublic).ToListAsync(cancellationToken);

    public async Task<(List<CustomizationSummary> Data, int Total)> SearchAsync(Guid? userId, bool ownerless, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(c => (!userId.HasValue || c.UserId == userId) && (!ownerless || c.UserId == null));
        var total = await query.CountAsync(cancellationToken);
        var data = await (from site in query
                          join template in DbContext.Set<Template>().AsNoTracking() on site.TemplateId equals template.Id into templates
                          from template in templates.DefaultIfEmpty()
                          orderby site.CreatedAtUtc descending, site.Id
                          select new CustomizationSummary(site.Id, site.UserId, site.TemplateId,
                              template == null ? "Template" : template.Name, site.Title, site.Slug, site.Revision,
                              site.LastVersionNumber, site.PublishedVersionId, site.CreatedAtUtc))
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return (data, total);
    }

    public async Task<(List<CustomizationVersionSummary> Data, int Total)> GetVersionsAsync(Guid customizationId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = DbContext.Set<CustomizationVersion>().AsNoTracking().Where(v => v.CustomizationId == customizationId);
        var total = await query.CountAsync(cancellationToken);
        var data = await query.OrderByDescending(v => v.VersionNumber).Skip((page - 1) * pageSize).Take(pageSize)
            .Select(v => new CustomizationVersionSummary(v.Id, v.CustomizationId, v.VersionNumber, v.Title, v.IsPublic, v.CreatedAtUtc, v.PublishedAtUtc))
            .ToListAsync(cancellationToken);
        return (data, total);
    }
}
