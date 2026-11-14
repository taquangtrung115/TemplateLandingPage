namespace OnePortal.Domain.Abstractions.Repositories;

using OnePortal.Domain.Abstractions;

public interface IRepositoryBase<TEntity, in TKey> where TEntity : Entity<TKey>
{
    Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default);
    Task<List<TEntity>> GetAllAsync(CancellationToken cancellationToken = default);
    void Add(TEntity entity);
    void Update(TEntity entity);
    void Remove(TEntity entity);
}
