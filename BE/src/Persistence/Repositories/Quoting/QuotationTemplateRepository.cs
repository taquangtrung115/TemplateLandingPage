namespace TemplateLandingPage.Persistence.Repositories.Quoting;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;
using TemplateLandingPage.Persistence.Repositories;

public sealed class QuotationTemplateRepository : RepositoryBase<QuotationTemplate, Guid>, IQuotationTemplateRepository
{
    public QuotationTemplateRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public Task<QuotationTemplate?> GetForReadWithVersionsAsync(Guid id, CancellationToken cancellationToken) =>
        DbSet.AsNoTracking().Include(template => template.Versions)
            .FirstOrDefaultAsync(template => template.Id == id && !template.IsDeleted, cancellationToken);

    public async Task<QuotationTemplate?> GetByIdWithVersionsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Versions)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, cancellationToken);
    }

    public async Task<QuotationTemplateVersion?> GetVersionAsync(Guid templateId, int version, CancellationToken cancellationToken = default)
    {
        return await DbContext.QuotationTemplateVersions
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.TemplateId == templateId && v.Version == version, cancellationToken);
    }

    public async Task<QuotationTemplate?> GetDefaultSystemTemplateAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Include(t => t.Versions)
            .FirstOrDefaultAsync(t => t.IsSystem && t.IsActive && !t.IsDeleted, cancellationToken);
    }

    public override async Task<List<QuotationTemplate>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Include(t => t.Versions)
            .Where(t => !t.IsDeleted)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }
}
