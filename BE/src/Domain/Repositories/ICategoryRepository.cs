namespace TemplateLandingPage.Domain.Repositories;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;

public interface ICategoryRepository : IRepositoryBase<Category, Guid>
{
    Task<Category?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<List<Category>> GetAllOrderedAsync(bool? isActiveOnly = null, CancellationToken cancellationToken = default);
    Task<bool> HasAssociatedTemplatesAsync(Guid categoryId, CancellationToken cancellationToken = default);
}
