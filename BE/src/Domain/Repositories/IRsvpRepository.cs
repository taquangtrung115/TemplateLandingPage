namespace TemplateLandingPage.Domain.Repositories;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;

public interface IRsvpRepository : IRepositoryBase<RsvpEntry, Guid>
{
    Task<List<RsvpEntry>> GetByCustomizationIdAsync(Guid customizationId, CancellationToken cancellationToken = default);
    Task<(List<RsvpEntry> Data, int Total)> GetPageByCustomizationVersionIdAsync(Guid versionId, int page, int pageSize, CancellationToken cancellationToken = default);
}
