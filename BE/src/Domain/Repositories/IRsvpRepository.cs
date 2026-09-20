namespace TemplateLandingPage.Domain.Repositories;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;

public interface IRsvpRepository : IRepositoryBase<RsvpEntry, Guid>
{
    Task<List<RsvpEntry>> GetByCustomizationIdAsync(Guid customizationId, CancellationToken cancellationToken = default);
}
