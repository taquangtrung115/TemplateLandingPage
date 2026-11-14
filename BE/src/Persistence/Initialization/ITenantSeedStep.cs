namespace OnePortal.Persistence.Initialization;

public interface ITenantSeedStep
{
    string AppKey { get; }
    string Key { get; }
    int Version { get; }
    Task ApplyAsync(ApplicationDbContext context, string tenantName, CancellationToken cancellationToken);
}
