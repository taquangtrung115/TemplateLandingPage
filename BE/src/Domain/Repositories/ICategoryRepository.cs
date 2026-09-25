namespace TemplateLandingPage.Domain.Repositories;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.ReadModels;

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
