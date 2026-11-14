namespace OnePortal.Domain.Repositories.Quoting;

using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;

public interface IQuotingProductGroupRepository : IRepositoryBase<QuotingProductGroup, Guid>
{
    Task<List<QuotingProductGroup>> SearchAsync(bool includeInactive, CancellationToken cancellationToken);
    Task<QuotingProductGroup?> ResolveAsync(Guid? id, string? legacyName, CancellationToken cancellationToken);
    Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId, CancellationToken cancellationToken);
    Task<bool> HasProductsAsync(Guid id, CancellationToken cancellationToken);
}
