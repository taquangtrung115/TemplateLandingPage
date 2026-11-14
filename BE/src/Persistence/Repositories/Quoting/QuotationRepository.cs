namespace OnePortal.Persistence.Repositories.Quoting;

using Microsoft.EntityFrameworkCore;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Domain.Repositories.Quoting;
using OnePortal.Persistence.Repositories;

public sealed class QuotationRepository : RepositoryBase<Quotation, Guid>, IQuotationRepository
{

    public QuotationRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<Quotation?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(q => q.Items)
            .Include(q => q.Histories)
            .Include(q => q.Files)
            .AsSplitQuery()
            .FirstOrDefaultAsync(q => q.Id == id && !q.IsDeleted, cancellationToken);
    }

    public async Task<Quotation?> GetByIdForReadAsync(Guid id, CancellationToken cancellationToken = default) =>
        await DbSet.AsNoTracking().AsSplitQuery().Include(quotation => quotation.Items).Include(quotation => quotation.Histories)
            .Include(quotation => quotation.Files).SingleOrDefaultAsync(quotation => quotation.Id == id && !quotation.IsDeleted, cancellationToken);

    public async Task<string> GenerateNextQuotationNumberAsync(CancellationToken cancellationToken = default)
    {
        var prefix = $"BG-{DateTime.UtcNow:yyyyMM}-";
        // PostgreSQL owns allocation across API processes; a process-local lock ends before save.
        if (DbContext.Database.IsNpgsql())
        {
            var sequence = await DbContext.Database.SqlQueryRaw<long>("SELECT nextval('quo.\"QuotationNumbers\"') AS \"Value\"")
                .SingleAsync(cancellationToken);
            return $"{prefix}{sequence:D4}";
        }
        var numbers = await DbSet.IgnoreQueryFilters().Where(entity => entity.TenantId == DbContext.CurrentTenantId).AsNoTracking().Where(quotation => quotation.QuotationNumber.StartsWith(prefix))
            .Select(quotation => quotation.QuotationNumber).ToListAsync(cancellationToken);
        var next = numbers.Select(number => long.TryParse(number[prefix.Length..], out var value) ? value : 0).DefaultIfEmpty(0).Max() + 1;
        return $"{prefix}{next:D4}";
    }

    public async Task<List<Quotation>> GetPagedAsync(
        string? status,
        Guid? customerId,
        string? searchTerm,
        int pageIndex,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = BuildFilteredQuery(status, customerId, searchTerm);

        return await query
            .OrderByDescending(q => q.CreatedAtUtc)
            .ThenByDescending(q => q.Id)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountAsync(
        string? status,
        Guid? customerId,
        string? searchTerm,
        CancellationToken cancellationToken = default)
    {
        var query = BuildFilteredQuery(status, customerId, searchTerm);
        return await query.CountAsync(cancellationToken);
    }

    private IQueryable<Quotation> BuildFilteredQuery(string? status, Guid? customerId, string? searchTerm)
    {
        var query = DbSet.AsNoTracking().Where(q => !q.IsDeleted);

        if (!string.IsNullOrWhiteSpace(status))
        {
            var normalizedStatus = status.Trim().ToLowerInvariant();
            query = query.Where(q => q.Status.ToLower() == normalizedStatus);
        }

        if (customerId.HasValue)
        {
            query = query.Where(q => q.CustomerId == customerId.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLowerInvariant();
            query = query.Where(q =>
                q.QuotationNumber.ToLower().Contains(term) ||
                q.CustomerName.ToLower().Contains(term) ||
                (q.CustomerPhone != null && q.CustomerPhone.ToLower().Contains(term)));
        }

        return query;
    }
}
