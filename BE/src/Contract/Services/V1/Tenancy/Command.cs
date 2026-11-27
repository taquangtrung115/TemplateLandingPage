namespace OnePortal.Contract.Services.V1.Tenancy;

using OnePortal.Contract.Abstractions.Message;

public sealed record ConfigureTenantApplicationCommand(Guid TenantId, string AppKey, bool IsEnabled, bool AllowSelfRegistration) : ICommand<ConfigureTenantApplicationResult>;

public sealed record ConfigureRegistrationCommand(bool AllowSelfRegistration) : ICommand<ConfigureRegistrationResult>;

public sealed record CreateTenantCommand(string Key, string Name, string[] Applications, string? AdminEmail) : ICommand<CreateTenantResult>;

public sealed record CreateTenantMemberCommand(Guid TenantId, string AppKey, string Email, string FullName, string Password, string Role) : ICommand<CreateTenantMemberResult>;

public sealed record SetTenantMembershipCommand(Guid TenantId, string AppKey, string Email, string Role, bool IsActive) : ICommand<SetTenantMembershipResult>;

public sealed record UpdateTenantCommand(Guid TenantId, string Name, bool IsActive) : ICommand<UpdateTenantResult>;
