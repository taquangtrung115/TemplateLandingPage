namespace OnePortal.Domain.Entities.Tenancy;

using OnePortal.Domain.Abstractions;

public sealed class TenantMembership : TenantEntity<Guid>
{
    public Guid UserId { get; private set; }
    public string AppKey { get; private set; } = string.Empty;
    public string Role { get; private set; } = "User";
    public bool IsActive { get; private set; } = true;
    private TenantMembership() { }

    public static TenantMembership Create(Guid tenantId, Guid userId, string appKey, string role)
    {
        var membership = new TenantMembership { Id = Guid.NewGuid(), UserId = userId, AppKey = appKey };
        membership.AssignTenant(tenantId); membership.Update(role, true);
        return membership;
    }
    public void Update(string role, bool isActive)
    {
        if (role is not ("Admin" or "User")) throw new ArgumentException("Invalid membership role.");
        Role = role; IsActive = isActive;
    }
}
