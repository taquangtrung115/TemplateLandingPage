namespace OnePortal.Domain.Entities.Tenancy;

using OnePortal.Domain.Abstractions;

public sealed class TenantWorkspaceMembership : TenantEntity<Guid>
{
    public Guid UserId { get; private set; }
    public string Role { get; private set; } = "User";

    public static TenantWorkspaceMembership Create(Guid tenantId, Guid userId, string role)
    {
        var membership = new TenantWorkspaceMembership { Id = Guid.NewGuid(), UserId = userId, Role = role };
        membership.AssignTenant(tenantId);
        return membership;
    }

    public void SetRole(string role) => Role = role;
}
