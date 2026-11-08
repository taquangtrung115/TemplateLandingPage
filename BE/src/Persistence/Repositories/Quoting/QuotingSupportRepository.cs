namespace TemplateLandingPage.Persistence.Repositories.Quoting;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class QuotingSupportRepository(ApplicationDbContext context)
    : RepositoryBase<QuotingSupportRequest, Guid>(context), IQuotingSupportRepository
{
    #region Read queries
    public Task<List<QuotingSupportRequest>> SearchAsync(QuotingSupportStatus status, string? searchTerm, string? priority, int page, int pageSize, CancellationToken cancellationToken) =>
        Filter(status, searchTerm, priority)
            .OrderBy(request => request.Priority == "urgent" ? 0 : request.Priority == "high" ? 1 : 2)
            .ThenBy(request => request.CreatedAtUtc).ThenBy(request => request.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

    public Task<int> CountAsync(QuotingSupportStatus status, string? searchTerm, string? priority, CancellationToken cancellationToken) =>
        Filter(status, searchTerm, priority).CountAsync(cancellationToken);

    private IQueryable<QuotingSupportRequest> Filter(QuotingSupportStatus status, string? searchTerm, string? priority)
    {
        var query = DbSet.AsNoTracking().Where(request => request.Status == status);
        if (!string.IsNullOrWhiteSpace(priority)) query = query.Where(request => request.Priority == priority);
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLowerInvariant();
            query = query.Where(request => request.FullName.ToLower().Contains(term) || request.Email.ToLower().Contains(term)
                || request.Topic.ToLower().Contains(term) || request.Message.ToLower().Contains(term)
                || (request.Phone != null && request.Phone.Contains(term)));
        }
        return query;
    }
    #endregion
}
