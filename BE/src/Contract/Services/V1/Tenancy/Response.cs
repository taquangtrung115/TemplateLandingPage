namespace OnePortal.Contract.Services.V1.Tenancy;

public sealed record RegistrationSettingsDto(string TenantName, string AppKey, bool AllowSelfRegistration);

public sealed record TenantApplicationDto(string AppKey, bool IsEnabled, bool AllowSelfRegistration, string ProvisioningStatus, int SeedVersion, string? LastInitializationError);

public sealed record TenantContextDto(Guid TenantId, string TenantKey, string TenantName, string AppKey, string Role);

public sealed record TenantDto(Guid Id, string Key, string Name, bool IsActive, IReadOnlyList<TenantApplicationDto> Applications);

public sealed record TenantMemberDto(Guid Id, string Email, string FullName, string Role, bool IsActive, bool AccountIsActive);

public sealed record WorkspaceApplicationsDto(string TenantName, IReadOnlyList<string> AppKeys);

public sealed record GetTenantContextsResult(IReadOnlyList<TenantContextDto> Items);

public sealed record GetTenantMembersResult(IReadOnlyList<TenantMemberDto> Items);

public sealed record GetRegistrationResult(RegistrationSettingsDto Settings);

public sealed record GetWorkspaceApplicationsResult(string TenantName, IReadOnlyList<string> AppKeys);

public sealed record SearchTenantsResult(IReadOnlyList<TenantDto> Items);

public sealed record ConfigureTenantApplicationResult(TenantDto Tenant);

public sealed record ConfigureRegistrationResult(RegistrationSettingsDto Settings);

public sealed record CreateTenantResult(TenantDto Tenant);

public sealed record CreateTenantMemberResult(TenantMemberDto Member);

public sealed record SetTenantMembershipResult(TenantMemberDto Member);

public sealed record UpdateTenantResult(TenantDto Tenant);
