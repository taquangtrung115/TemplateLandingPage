namespace TemplateLandingPage.Domain.Repositories;

using TemplateLandingPage.Domain.ReadModels;

public interface IAdminOverviewRepository
{
    Task<AdminOverviewCounts> GetCountsAsync(CancellationToken cancellationToken = default);
}
