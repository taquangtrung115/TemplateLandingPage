namespace TemplateLandingPage.Domain.Repositories;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;

public interface ITemplateRepository : IRepositoryBase<Template, Guid>
{
    Task<Template?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<List<Template>> GetListAsync(
        string? category = null,
        Guid? categoryId = null,
        string? badge = null,
        string? search = null,
        bool? isActiveOnly = null,
        bool? isCommunity = null,
        CancellationToken cancellationToken = default);
}
