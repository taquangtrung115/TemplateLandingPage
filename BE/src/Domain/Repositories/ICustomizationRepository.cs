namespace TemplateLandingPage.Domain.Repositories;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;

public interface ICustomizationRepository : IRepositoryBase<UserCustomization, Guid>
{
    Task<UserCustomization?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<List<UserCustomization>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default);
}
