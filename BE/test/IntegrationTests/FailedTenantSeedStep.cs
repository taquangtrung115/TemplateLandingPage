namespace OnePortal.IntegrationTests;

using OnePortal.Persistence;
using OnePortal.Persistence.Initialization;
using OnePortal.Domain.Entities;

internal sealed class FailedTenantSeedStep : ITenantSeedStep
{
    public string AppKey => "landing";
    public string Key => "failure-test";
    public int Version => 2;
    public async Task ApplyAsync(ApplicationDbContext context, string tenantName, CancellationToken cancellationToken)
    {
        context.Categories.Add(Category.Create("Partial", "partial-seed", null, "Layout", 0));
        await context.SaveChangesAsync(cancellationToken);
        throw new InvalidOperationException("Synthetic seed failure");
    }
}
