namespace OnePortal.Domain.Abstractions;

public interface ITenantEntity
{
    Guid TenantId { get; }
    void AssignTenant(Guid tenantId);
}
