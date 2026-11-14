namespace OnePortal.Persistence.Initialization;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using OnePortal.Application.Services.Tenancy;
using OnePortal.Domain.Entities.Tenancy;

public static class DatabaseInitializer
{
    #region Seed registry
    public static IReadOnlyList<ITenantSeedStep> Steps { get; } = [new LandingFoundationSeed(), new QuotingFoundationSeed()];
    public static int RequiredVersion(string appKey) => Steps.Where(step => step.AppKey == appKey).Max(step => step.Version);
    #endregion

    #region Initialization
    public static Task InitializeAsync(ApplicationDbContext context, CancellationToken cancellationToken = default) => context.Database.MigrateAsync(cancellationToken);

    public static async Task SeedAsync(ApplicationDbContext context, CancellationToken cancellationToken = default)
    {
        if (!context.Database.IsNpgsql()) return;
        // EF also invokes seeding after a downgrade, possibly before tenancy tables exist.
        if (!await context.Database.SqlQueryRaw<bool>("SELECT to_regclass('platform.\"Tenants\"') IS NOT NULL AS \"Value\"").SingleAsync(cancellationToken)) return;
        var existingApps = await context.Applications.Select(application => application.Id).ToListAsync(cancellationToken);
        foreach (var appKey in TenantDefaults.ApplicationKeys.Except(existingApps))
            context.Applications.Add(PlatformApplication.Create(appKey, appKey == "landing" ? "Landing Page" : "Quoting"));
        if (!await context.SystemSeedHistory.AnyAsync(history => history.Id == "platform-v1", cancellationToken))
            context.SystemSeedHistory.Add(SystemSeedHistory.Complete("platform-v1", 1));
        await context.SaveChangesAsync(cancellationToken);

        var options = context.GetOptions();
        var pending = new List<(Guid TenantId, string AppKey)>();
        foreach (var appKey in TenantDefaults.ApplicationKeys)
        {
            var requiredVersion = RequiredVersion(appKey);
            var targets = await context.TenantApplications.IgnoreQueryFilters().AsNoTracking()
                .Where(application => application.AppKey == appKey && application.IsEnabled
                    && (application.SeedVersion < requiredVersion || application.ProvisioningStatus != "Ready"))
                .OrderBy(application => application.TenantId).Select(application => new { application.TenantId, application.AppKey }).ToListAsync(cancellationToken);
            pending.AddRange(targets.Select(application => (application.TenantId, application.AppKey)));
        }
        foreach (var batch in pending.Chunk(50))
        foreach (var application in batch.Where(application => application.AppKey is "landing" or "quoting"))
        {
            var scopedOptions = context.Database.CurrentTransaction is null ? options
                : new DbContextOptionsBuilder<ApplicationDbContext>(options).UseNpgsql(context.Database.GetDbConnection()).Options;
            await using var scoped = new ApplicationDbContext(scopedOptions, TenantContext.For(application.TenantId, application.AppKey));
            if (context.Database.CurrentTransaction is not null)
                await scoped.Database.UseTransactionAsync(context.Database.CurrentTransaction.GetDbTransaction(), cancellationToken);
            await ProvisionAsync(scoped, cancellationToken);
        }
    }

    public static async Task ProvisionAsync(ApplicationDbContext context, CancellationToken cancellationToken = default, IReadOnlyList<ITenantSeedStep>? seedSteps = null)
    {
        // EF migration seeding already owns a transaction, shared with this tenant-scoped context.
        if (context.Database.CurrentTransaction is not null)
        {
            await ApplyStepsAsync(context, seedSteps ?? Steps, cancellationToken);
            return;
        }
        try
        {
            await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                context.ChangeTracker.Clear();
                await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
                await ApplyStepsAsync(context, seedSteps ?? Steps, cancellationToken);
                await transaction.CommitAsync(cancellationToken);
            });
        }
        catch
        {
            context.ChangeTracker.Clear();
            var application = await context.TenantApplications.SingleOrDefaultAsync(application => application.AppKey == context.CurrentAppKey, cancellationToken);
            if (application is not null) { application.MarkFailed(); await context.SaveChangesAsync(cancellationToken); }
            throw;
        }
    }

    private static async Task ApplyStepsAsync(ApplicationDbContext context, IReadOnlyList<ITenantSeedStep> seedSteps, CancellationToken cancellationToken)
    {
        await context.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({context.CurrentTenantId.ToString() + ":" + context.CurrentAppKey}, 0))", cancellationToken);
        var application = await context.TenantApplications.SingleAsync(application => application.AppKey == context.CurrentAppKey, cancellationToken);
        var tenantName = await context.Tenants.Where(tenant => tenant.Id == context.CurrentTenantId).Select(tenant => tenant.Name).SingleAsync(cancellationToken);
        var completed = await context.TenantSeedHistory.Where(history => history.AppKey == context.CurrentAppKey).ToListAsync(cancellationToken);
        foreach (var step in seedSteps.Where(step => step.AppKey == context.CurrentAppKey).OrderBy(step => step.Version).ThenBy(step => step.Key))
        {
            if (completed.Any(history => history.SeedKey == step.Key && history.Version == step.Version)) continue;
            await step.ApplyAsync(context, tenantName, cancellationToken);
            context.TenantSeedHistory.Add(TenantSeedHistory.Complete(context.CurrentTenantId, step.AppKey, step.Key, step.Version));
        }
        application.MarkReady(seedSteps.Where(step => step.AppKey == context.CurrentAppKey).Max(step => step.Version));
        await context.SaveChangesAsync(cancellationToken);
    }

    public static async Task BootstrapAdministratorAsync(ApplicationDbContext context, IConfiguration configuration, CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(configuration["Tenancy:BootstrapPlatformAdminUserId"], out var userId)) return;
        var historyKey = "bootstrap-admin:" + userId.ToString("N");
        await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            context.ChangeTracker.Clear();
            await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
            await context.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({historyKey}, 0))", cancellationToken);
            if (await context.SystemSeedHistory.AnyAsync(history => history.Id == historyKey, cancellationToken)) return;
            var user = await context.Users.SingleOrDefaultAsync(user => user.Id == userId && user.IsActive, cancellationToken)
                ?? throw new InvalidOperationException("The configured platform administrator does not exist or is inactive.");
            user.SetPlatformAdmin(true);
            context.SystemSeedHistory.Add(SystemSeedHistory.Complete(historyKey, 1));
            await context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        });
    }
    #endregion
}
