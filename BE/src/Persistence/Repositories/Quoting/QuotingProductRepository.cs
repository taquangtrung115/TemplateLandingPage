namespace OnePortal.Persistence.Repositories.Quoting;

using Microsoft.EntityFrameworkCore;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Domain.Repositories.Quoting;
using OnePortal.Persistence.Repositories;

public sealed class QuotingProductRepository : RepositoryBase<QuotingProduct, Guid>, IQuotingProductRepository
{
    public QuotingProductRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public Task<QuotingProduct?> GetForReadAsync(Guid id, CancellationToken cancellationToken) =>
        DbSet.AsNoTracking().Include(p => p.Group).FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);

    public async Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalizedCode = code.Trim().ToUpperInvariant();
        var query = DbSet.AsNoTracking().Where(p => p.Code == normalizedCode && !p.IsDeleted);

        if (excludeId.HasValue)
        {
            query = query.Where(p => p.Id != excludeId.Value);
        }

        return !await query.AnyAsync(cancellationToken);
    }

    public async Task<List<QuotingProduct>> SearchAsync(string? searchTerm, string? category, bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Include(p => p.Group).Where(p => !p.IsDeleted);

        if (!includeInactive)
        {
            query = query.Where(p => p.IsActive && (p.GroupId == null || (p.Group != null && p.Group.IsActive && !p.Group.IsDeleted)));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            var normalizedCat = category.Trim().ToLowerInvariant();
            query = query.Where(p => (p.Group != null ? p.Group.Name : p.Category) != null && (p.Group != null ? p.Group.Name : p.Category)!.ToLower() == normalizedCat);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLowerInvariant();
            query = query.Where(p => p.Code.ToLower().Contains(term) || p.Name.ToLower().Contains(term));
        }

        return await query.OrderBy(p => p.Group != null ? p.Group.SortOrder : 0).ThenBy(p => p.Code).ToListAsync(cancellationToken);
    }
}
