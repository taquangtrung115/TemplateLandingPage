namespace TemplateLandingPage.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

public sealed class RsvpRepository : RepositoryBase<RsvpEntry, Guid>, IRsvpRepository
{
    public RsvpRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<List<RsvpEntry>> GetByCustomizationIdAsync(Guid customizationId, CancellationToken cancellationToken = default)
    {
        return await DbSet.Where(r => r.CustomizationId == customizationId)
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }
}
