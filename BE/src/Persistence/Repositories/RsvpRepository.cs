namespace OnePortal.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Repositories;

public sealed class RsvpRepository : RepositoryBase<RsvpEntry, Guid>, IRsvpRepository
{
    public RsvpRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<List<RsvpEntry>> GetByCustomizationIdAsync(Guid customizationId, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking().Where(r => r.CustomizationId == customizationId)
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<(List<RsvpEntry> Data, int Total)> GetPageByCustomizationVersionIdAsync(Guid versionId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(entry => entry.CustomizationVersionId == versionId);
        var total = await query.CountAsync(cancellationToken);
        var data = await query
            .OrderByDescending(entry => entry.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (data, total);
    }
}
