namespace OnePortal.Domain.Repositories;

using OnePortal.Domain.ReadModels;

public interface IAdminOverviewRepository
{
    Task<AdminOverviewCounts> GetCountsAsync(CancellationToken cancellationToken = default);
}
