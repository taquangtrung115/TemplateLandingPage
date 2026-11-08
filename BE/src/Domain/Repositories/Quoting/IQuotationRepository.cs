namespace TemplateLandingPage.Domain.Repositories.Quoting;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;

public interface IQuotationRepository : IRepositoryBase<Quotation, Guid>
{
    Task<Quotation?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Quotation?> GetByIdForReadAsync(Guid id, CancellationToken cancellationToken = default);
    Task<string> GenerateNextQuotationNumberAsync(CancellationToken cancellationToken = default);
    Task<List<Quotation>> GetPagedAsync(string? status, Guid? customerId, string? searchTerm, int pageIndex, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(string? status, Guid? customerId, string? searchTerm, CancellationToken cancellationToken = default);
}
