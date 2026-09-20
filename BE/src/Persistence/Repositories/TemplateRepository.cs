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
        return await DbSet.FirstOrDefaultAsync(t => t.Slug == slug.ToLowerInvariant(), cancellationToken);
    }

    public async Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(t => t.Slug == slug.ToLowerInvariant(), cancellationToken);
    }
}
