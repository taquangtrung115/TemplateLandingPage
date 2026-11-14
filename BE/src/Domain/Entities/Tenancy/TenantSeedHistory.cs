namespace OnePortal.Domain.Entities.Tenancy;

using OnePortal.Domain.Abstractions;

public sealed class TenantSeedHistory : TenantEntity<Guid>
{
    public string AppKey { get; private set; } = string.Empty;
    public string SeedKey { get; private set; } = string.Empty;
    public int Version { get; private set; }
    public DateTime CompletedAtUtc { get; private set; }
    private TenantSeedHistory() { }
    public static TenantSeedHistory Complete(Guid tenantId, string appKey, string seedKey, int version)
    {
        var history = new TenantSeedHistory { Id = Guid.NewGuid(), AppKey = appKey, SeedKey = seedKey, Version = version, CompletedAtUtc = DateTime.UtcNow };
        history.AssignTenant(tenantId); return history;
    }
}
