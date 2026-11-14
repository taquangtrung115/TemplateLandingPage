namespace OnePortal.Domain.Entities.Tenancy;

using OnePortal.Domain.Abstractions;

public sealed class TenantApplication : TenantEntity<Guid>
{
    #region State
    public string AppKey { get; private set; } = string.Empty;
    public bool IsEnabled { get; private set; } = true;
    public bool AllowSelfRegistration { get; private set; }
    public string ProvisioningStatus { get; private set; } = "Provisioning";
    public string? LastInitializationError { get; private set; }
    public int SeedVersion { get; private set; }
    private TenantApplication() { }
    #endregion

    #region Commands
    public static TenantApplication Create(Guid tenantId, string appKey, bool allowSelfRegistration = false)
    {
        var application = new TenantApplication { Id = Guid.NewGuid(), AppKey = appKey, AllowSelfRegistration = appKey == "landing" && allowSelfRegistration };
        application.AssignTenant(tenantId);
        return application;
    }
    public void Configure(bool isEnabled, bool allowSelfRegistration)
    {
        IsEnabled = isEnabled;
        AllowSelfRegistration = AppKey == "landing" && allowSelfRegistration;
    }
    public void MarkReady(int version) { ProvisioningStatus = "Ready"; SeedVersion = version; LastInitializationError = null; }
    public void MarkFailed() { ProvisioningStatus = "Failed"; LastInitializationError = "Workspace initialization failed. Retry initialization."; }
    #endregion
}
