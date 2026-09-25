namespace TemplateLandingPage.Domain.Repositories;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;

public interface IGuestbookRepository : IRepositoryBase<GuestbookEntry, Guid>
{
    Task<List<GuestbookEntry>> GetByCustomizationIdAsync(Guid customizationId, CancellationToken cancellationToken = default);
    Task<(List<GuestbookEntry> Data, int Total)> GetPageByCustomizationVersionIdAsync(Guid versionId, int page, int pageSize, CancellationToken cancellationToken = default);
}
