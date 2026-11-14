namespace OnePortal.Application.Services.Tenancy;

using OnePortal.Application.Abstractions;

public sealed class TenantContext : ITenantContext
{
    public Guid? TenantId { get; private set; }
    public string? AppKey { get; private set; }
    public string? TenantKey { get; private set; }
    public void Initialize(Guid tenantId, string appKey, string? tenantKey = null)
    {
        if (tenantId == Guid.Empty || appKey is not ("landing" or "quoting")) throw new ArgumentException("Invalid tenant context.");
        if (TenantId.HasValue && (TenantId != tenantId || AppKey != appKey)) throw new InvalidOperationException("A request cannot change tenant context.");
        TenantId = tenantId; AppKey = appKey; TenantKey = tenantKey;
    }
    public static TenantContext For(Guid tenantId, string appKey)
    {
        var context = new TenantContext(); context.Initialize(tenantId, appKey); return context;
    }
}
