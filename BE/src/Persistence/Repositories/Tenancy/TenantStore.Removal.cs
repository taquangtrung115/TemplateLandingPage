namespace OnePortal.Persistence.Repositories.Tenancy;

using Microsoft.EntityFrameworkCore;
using OnePortal.Application.UseCases.V1.Tenancy.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Tenancy;
using OnePortal.Domain.Abstractions;
using OnePortal.Domain.Entities.Tenancy;

public sealed partial class TenantStore
{
    #region Removal commands
    public Task<Result<bool>> DeleteAsync(Guid tenantId, string confirmKey, bool force, CancellationToken cancellationToken) =>
        database.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            await using var transaction = await database.Database.BeginTransactionAsync(cancellationToken);
            await LockAllApplicationsAsync(database, tenantId, cancellationToken);
            var locked = await database.Tenants.FromSqlInterpolated($"SELECT * FROM platform.\"Tenants\" WHERE \"Id\" = {tenantId} FOR UPDATE")
                .AsNoTracking().ToListAsync(cancellationToken);
            var tenant = locked.SingleOrDefault();
            if (tenant is null) return Result.Failure<bool>(TenancyErrors.NotFound);
            if (!string.Equals(confirmKey.Trim(), tenant.Key, StringComparison.OrdinalIgnoreCase)) return Result.Failure<bool>(TenancyErrors.InvalidConfirmation);
            if (tenantId == TenantDefaults.LandingId || tenantId == TenantDefaults.QuotingId || tenantId == TenantDefaults.PhotoPrintId)
                return Result.Failure<bool>(TenancyErrors.ProtectedTenant);
            if (!force && (await ForTenant(database.Quotations, tenantId).AnyAsync(cancellationToken)
                || await ForTenant(database.PhotoOrders, tenantId).AnyAsync(cancellationToken)
                || await ForTenant(database.PhotoPaymentTransactions, tenantId).AnyAsync(cancellationToken)
                || await ForTenant(database.UserCustomizations, tenantId).AnyAsync(row => row.IsPublished || row.PublishedVersionId != null, cancellationToken)
                || await ForTenant(database.CustomizationVersions, tenantId).AnyAsync(row => row.PublishedAtUtc != null, cancellationToken)))
                return Result.Failure<bool>(TenancyErrors.HasBusinessData);

            foreach (var appKey in TenantDefaults.ApplicationKeys)
                await PurgeApplicationRowsAsync(tenantId, appKey, cancellationToken);
            await ForTenant(database.TenantWorkspaceMemberships, tenantId).ExecuteDeleteAsync(cancellationToken);
            await database.Tenants.Where(row => row.Id == tenantId).ExecuteDeleteAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return Result.Success(true);
        });

    public Task<Result<TenantDto>> UninstallApplicationAsync(Guid tenantId, string appKey, bool purgeData, CancellationToken cancellationToken) =>
        database.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            await using var transaction = await database.Database.BeginTransactionAsync(cancellationToken);
            await LockApplicationAsync(database, tenantId, appKey, cancellationToken);
            var applications = ForTenant(database.TenantApplications, tenantId).Where(row => row.AppKey == appKey);
            if (!await applications.AnyAsync(cancellationToken)) return Result.Failure<TenantDto>(TenancyErrors.NotFound);
            if (purgeData)
                await PurgeApplicationRowsAsync(tenantId, appKey, cancellationToken);
            else
                await applications.ExecuteUpdateAsync(update => update.SetProperty(row => row.IsEnabled, false)
                    .SetProperty(row => row.AllowSelfRegistration, false), cancellationToken);

            var tenant = await DescribeAsync(tenantId, cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return Result.Success(tenant);
        });
    #endregion

    #region Tenant-scoped purge
    private static IQueryable<TEntity> ForTenant<TEntity>(DbSet<TEntity> rows, Guid tenantId)
        where TEntity : class, ITenantEntity => rows.IgnoreQueryFilters().Where(row => row.TenantId == tenantId);

    private async Task PurgeApplicationRowsAsync(Guid tenantId, string appKey, CancellationToken cancellationToken)
    {
        switch (appKey)
        {
            case "photoprint":
                await ForTenant(database.PhotoPaymentTransactions, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.PhotoOrderItems, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.PhotoOrders, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.PhotoDemos, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.PhotoProducts, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.PhotoCategories, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.PhotoSupportRequests, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.PhotoContactConfigs, tenantId).ExecuteDeleteAsync(cancellationToken);
                break;
            case "quoting":
                await ForTenant(database.QuotationHistories, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.QuotationItems, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.QuotationFiles, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.Quotations, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.QuotationTemplateVersions, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.QuotationTemplates, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.QuotingCustomers, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.QuotingProducts, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.QuotingProductGroups, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.QuotingSupportRequests, tenantId).ExecuteDeleteAsync(cancellationToken);
                break;
            case "landing":
                // Published drafts and navigation submenus can reference rows in the deletion set.
                await ForTenant(database.UserCustomizations, tenantId).Where(row => row.PublishedVersionId != null)
                    .ExecuteUpdateAsync(update => update.SetProperty(row => row.PublishedVersionId, (Guid?)null), cancellationToken);
                await ForTenant(database.NavigationMenus, tenantId).Where(row => row.ParentId != null)
                    .ExecuteUpdateAsync(update => update.SetProperty(row => row.ParentId, (Guid?)null), cancellationToken);
                await ForTenant(database.CustomizationSlugAliases, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.RsvpEntries, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.GuestbookEntries, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.CustomizationVersions, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.UserCustomizations, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.Products, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.NavigationMenus, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.Templates, tenantId).ExecuteDeleteAsync(cancellationToken);
                await ForTenant(database.Categories, tenantId).ExecuteDeleteAsync(cancellationToken);
                break;
        }
        await ForTenant(database.TenantMemberships, tenantId).Where(row => row.AppKey == appKey).ExecuteDeleteAsync(cancellationToken);
        await ForTenant(database.TenantSeedHistory, tenantId).Where(row => row.AppKey == appKey).ExecuteDeleteAsync(cancellationToken);
        await ForTenant(database.TenantApplications, tenantId).Where(row => row.AppKey == appKey).ExecuteDeleteAsync(cancellationToken);
    }
    #endregion
}
