namespace TemplateLandingPage.Domain.Repositories.Quoting;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;

public interface IQuotingSupportRepository : IRepositoryBase<QuotingSupportRequest, Guid>
{
    Task<List<QuotingSupportRequest>> SearchAsync(QuotingSupportStatus status, string? searchTerm, string? priority, int page, int pageSize, CancellationToken cancellationToken);
    Task<int> CountAsync(QuotingSupportStatus status, string? searchTerm, string? priority, CancellationToken cancellationToken);
}
