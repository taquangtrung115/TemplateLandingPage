namespace OnePortal.Domain.Repositories.Quoting;

using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;

public interface IQuotingProductRepository : IRepositoryBase<QuotingProduct, Guid>
{
    Task<QuotingProduct?> GetForReadAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task<List<QuotingProduct>> SearchAsync(string? searchTerm, string? category, bool includeInactive = false, CancellationToken cancellationToken = default);
}
