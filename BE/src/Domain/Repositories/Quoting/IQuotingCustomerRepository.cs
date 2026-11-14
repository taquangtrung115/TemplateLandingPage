namespace OnePortal.Domain.Repositories.Quoting;

using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;

public interface IQuotingCustomerRepository : IRepositoryBase<QuotingCustomer, Guid>
{
    Task<QuotingCustomer?> GetForReadAsync(Guid id, CancellationToken cancellationToken);
    Task<List<QuotingCustomer>> SearchAsync(string? searchTerm, bool includeInactive = false, CancellationToken cancellationToken = default);
}
