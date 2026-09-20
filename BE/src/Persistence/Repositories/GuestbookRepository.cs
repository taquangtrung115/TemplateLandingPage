namespace TemplateLandingPage.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

public sealed class GuestbookRepository : RepositoryBase<GuestbookEntry, Guid>, IGuestbookRepository
{
    public GuestbookRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<List<GuestbookEntry>> GetByCustomizationIdAsync(Guid customizationId, CancellationToken cancellationToken = default)
    {
        return await DbSet.Where(g => g.CustomizationId == customizationId)
            .OrderByDescending(g => g.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }
}
