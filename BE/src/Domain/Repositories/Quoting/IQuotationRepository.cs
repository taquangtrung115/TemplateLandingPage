namespace OnePortal.Domain.Repositories.Quoting;

using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;

public interface IQuotationRepository : IRepositoryBase<Quotation, Guid>
{
    Task<Quotation?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Quotation?> GetByIdForReadAsync(Guid id, CancellationToken cancellationToken = default);
    Task<string> GenerateNextQuotationNumberAsync(CancellationToken cancellationToken = default);
    Task<List<Quotation>> GetPagedAsync(string? status, Guid? customerId, string? searchTerm, int pageIndex, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(string? status, Guid? customerId, string? searchTerm, CancellationToken cancellationToken = default);
}
