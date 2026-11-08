namespace TemplateLandingPage.Persistence.Repositories.Quoting;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;
using TemplateLandingPage.Persistence.Repositories;

public sealed class QuotingProductRepository : RepositoryBase<QuotingProduct, Guid>, IQuotingProductRepository
{
    public QuotingProductRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

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
        var query = DbSet.AsNoTracking().Where(p => !p.IsDeleted);

        if (!includeInactive)
        {
            query = query.Where(p => p.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            var normalizedCat = category.Trim().ToLowerInvariant();
            query = query.Where(p => p.Category != null && p.Category.ToLower() == normalizedCat);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLowerInvariant();
            query = query.Where(p => p.Code.ToLower().Contains(term) || p.Name.ToLower().Contains(term));
        }

        return await query.OrderBy(p => p.Code).ToListAsync(cancellationToken);
    }
}
