namespace TemplateLandingPage.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

public sealed class CustomizationRepository : RepositoryBase<UserCustomization, Guid>, ICustomizationRepository
{
    public CustomizationRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<UserCustomization?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbSet.FirstOrDefaultAsync(c => c.Slug == slug.ToLowerInvariant(), cancellationToken);
    }

    public async Task<List<UserCustomization>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet.Where(c => c.UserId == userId).ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(c => c.Slug == slug.ToLowerInvariant(), cancellationToken);
    }
}
