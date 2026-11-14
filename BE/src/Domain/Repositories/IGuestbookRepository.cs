namespace OnePortal.Domain.Repositories;

using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;

public interface IGuestbookRepository : IRepositoryBase<GuestbookEntry, Guid>
{
    Task<List<GuestbookEntry>> GetByCustomizationIdAsync(Guid customizationId, CancellationToken cancellationToken = default);
    Task<(List<GuestbookEntry> Data, int Total)> GetPageByCustomizationVersionIdAsync(Guid versionId, int page, int pageSize, CancellationToken cancellationToken = default);
}
