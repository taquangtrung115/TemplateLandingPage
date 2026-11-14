namespace OnePortal.Domain.Abstractions;

public abstract class TenantEntity<TKey> : Entity<TKey>, ITenantEntity
{
    #region Tenant ownership
    public Guid TenantId { get; private set; }

    public void AssignTenant(Guid tenantId)
    {
        if (tenantId == Guid.Empty) throw new ArgumentException("A tenant is required.", nameof(tenantId));
        if (TenantId != Guid.Empty && TenantId != tenantId)
            throw new InvalidOperationException("Tenant ownership cannot change.");
        TenantId = tenantId;
    }
    #endregion
}
