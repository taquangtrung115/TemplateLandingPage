namespace TemplateLandingPage.Domain.Repositories.Quoting;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;

public interface IQuotingCustomerRepository : IRepositoryBase<QuotingCustomer, Guid>
{
    Task<List<QuotingCustomer>> SearchAsync(string? searchTerm, bool includeInactive = false, CancellationToken cancellationToken = default);
}
