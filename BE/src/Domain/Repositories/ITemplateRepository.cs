namespace TemplateLandingPage.Domain.Repositories;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.ReadModels;

public interface ITemplateRepository : IRepositoryBase<Template, Guid>
{
    Task<Template?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<Template?> GetBySlugAsync(string slug, bool includeInactive, CancellationToken cancellationToken = default);
    Task<Template?> GetVisibleByIdAsync(Guid id, bool includeInactive, CancellationToken cancellationToken = default);
    Task<string?> GetNameByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<List<TemplateSummary>> GetListAsync(
        string? category = null,
        Guid? categoryId = null,
        string? badge = null,
        string? search = null,
        bool? isActiveOnly = null,
        bool? isCommunity = null,
        CancellationToken cancellationToken = default);
}
