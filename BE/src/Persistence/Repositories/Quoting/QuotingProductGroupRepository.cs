namespace TemplateLandingPage.Persistence.Repositories.Quoting;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class QuotingProductGroupRepository(ApplicationDbContext context)
    : RepositoryBase<QuotingProductGroup, Guid>(context), IQuotingProductGroupRepository
{
    #region Queries
    public Task<List<QuotingProductGroup>> SearchAsync(bool includeInactive, CancellationToken cancellationToken) =>
        DbSet.AsNoTracking().Where(group => !group.IsDeleted && (includeInactive || group.IsActive))
            .OrderBy(group => group.SortOrder).ThenBy(group => group.Code).ToListAsync(cancellationToken);

    public Task<QuotingProductGroup?> ResolveAsync(Guid? id, string? legacyName, CancellationToken cancellationToken) =>
        DbSet.AsNoTracking().FirstOrDefaultAsync(group => !group.IsDeleted &&
            (id.HasValue ? group.Id == id.Value : group.Name == (legacyName ?? "").Trim()), cancellationToken);

    public async Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId, CancellationToken cancellationToken) =>
        !await DbSet.AsNoTracking().AnyAsync(group => group.Code == code.Trim().ToUpper() &&
            (!excludeId.HasValue || group.Id != excludeId.Value), cancellationToken);

    public Task<bool> HasProductsAsync(Guid id, CancellationToken cancellationToken) =>
        DbContext.QuotingProducts.AsNoTracking().AnyAsync(product => !product.IsDeleted && product.GroupId == id, cancellationToken);
    #endregion
}
