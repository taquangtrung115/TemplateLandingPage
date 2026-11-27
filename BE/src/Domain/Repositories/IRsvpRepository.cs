namespace OnePortal.Domain.Repositories;

using OnePortal.Domain.Entities.Interactions;
using OnePortal.Domain.Abstractions.Repositories;
public interface IRsvpRepository : IRepositoryBase<RsvpEntry, Guid>
{
    Task<List<RsvpEntry>> GetByCustomizationIdAsync(Guid customizationId, CancellationToken cancellationToken = default);
    Task<(List<RsvpEntry> Data, int Total)> GetPageByCustomizationVersionIdAsync(Guid versionId, int page, int pageSize, CancellationToken cancellationToken = default);
}
