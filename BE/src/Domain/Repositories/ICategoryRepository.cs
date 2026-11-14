namespace OnePortal.Domain.Repositories;

using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;
using OnePortal.Domain.ReadModels;

public interface ICategoryRepository : IRepositoryBase<Category, Guid>
{
    Task<Category?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<Category?> GetActiveByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CategorySummary?> GetSummaryBySlugAsync(string slug, bool includeInactive, CancellationToken cancellationToken = default);
    Task<CategorySummary?> GetSummaryByIdAsync(Guid id, bool includeInactive, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<List<CategorySummary>> GetSummariesAsync(bool includeInactive, CancellationToken cancellationToken = default);
    Task<bool> HasAssociatedTemplatesAsync(Guid categoryId, CancellationToken cancellationToken = default);
}
