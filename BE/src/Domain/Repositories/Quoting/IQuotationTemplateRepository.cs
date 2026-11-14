namespace OnePortal.Domain.Repositories.Quoting;

using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;

public interface IQuotationTemplateRepository : IRepositoryBase<QuotationTemplate, Guid>
{
    Task<QuotationTemplate?> GetForReadWithVersionsAsync(Guid id, CancellationToken cancellationToken);
    Task<QuotationTemplate?> GetByIdWithVersionsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<QuotationTemplateVersion?> GetVersionAsync(Guid templateId, int version, CancellationToken cancellationToken = default);
    Task<QuotationTemplate?> GetDefaultSystemTemplateAsync(CancellationToken cancellationToken = default);
}
