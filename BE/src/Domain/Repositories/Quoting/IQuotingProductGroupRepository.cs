namespace TemplateLandingPage.Domain.Repositories.Quoting;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;

public interface IQuotingProductGroupRepository : IRepositoryBase<QuotingProductGroup, Guid>
{
    Task<List<QuotingProductGroup>> SearchAsync(bool includeInactive, CancellationToken cancellationToken);
    Task<QuotingProductGroup?> ResolveAsync(Guid? id, string? legacyName, CancellationToken cancellationToken);
    Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId, CancellationToken cancellationToken);
    Task<bool> HasProductsAsync(Guid id, CancellationToken cancellationToken);
}
