namespace TemplateLandingPage.Domain.Repositories.Quoting;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;

public interface IQuotationTemplateRepository : IRepositoryBase<QuotationTemplate, Guid>
{
    Task<QuotationTemplate?> GetByIdWithVersionsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<QuotationTemplateVersion?> GetVersionAsync(Guid templateId, int version, CancellationToken cancellationToken = default);
    Task<QuotationTemplate?> GetDefaultSystemTemplateAsync(CancellationToken cancellationToken = default);
}
