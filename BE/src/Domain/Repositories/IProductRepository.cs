namespace TemplateLandingPage.Domain.Repositories;

using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;

public interface IProductRepository : IRepositoryBase<Product, Guid>
{
    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default);
}
