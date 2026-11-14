namespace OnePortal.Domain.Repositories.Quoting;

using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;

public interface IQuotingSupportRepository : IRepositoryBase<QuotingSupportRequest, Guid>
{
    Task<List<QuotingSupportRequest>> SearchAsync(QuotingSupportStatus status, string? searchTerm, string? priority, int page, int pageSize, CancellationToken cancellationToken);
    Task<int> CountAsync(QuotingSupportStatus status, string? searchTerm, string? priority, CancellationToken cancellationToken);
}
