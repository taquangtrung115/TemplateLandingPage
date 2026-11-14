namespace OnePortal.Persistence;

using OnePortal.Domain.Abstractions.Repositories;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using OnePortal.Domain.Exceptions;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _dbContext;

    public UnitOfWork(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new WriteConflictException();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
        {
            throw new WriteConflictException();
        }
    }
}
