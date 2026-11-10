namespace TemplateLandingPage.Persistence.Repositories.Quoting;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;
using TemplateLandingPage.Persistence.Repositories;

public sealed class QuotingCustomerRepository : RepositoryBase<QuotingCustomer, Guid>, IQuotingCustomerRepository
{
    public QuotingCustomerRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public Task<QuotingCustomer?> GetForReadAsync(Guid id, CancellationToken cancellationToken) =>
        DbSet.AsNoTracking().FirstOrDefaultAsync(customer => customer.Id == id && !customer.IsDeleted, cancellationToken);

    public async Task<List<QuotingCustomer>> SearchAsync(string? searchTerm, bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(c => !c.IsDeleted);

        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLowerInvariant();
            query = query.Where(c =>
                c.Name.ToLower().Contains(term) ||
                (c.ContactPerson != null && c.ContactPerson.ToLower().Contains(term)) ||
                c.Phone.ToLower().Contains(term) ||
                (c.Email != null && c.Email.ToLower().Contains(term)) ||
                (c.TaxCode != null && c.TaxCode.ToLower().Contains(term)));
        }

        return await query.OrderBy(c => c.Name).ToListAsync(cancellationToken);
    }
}
