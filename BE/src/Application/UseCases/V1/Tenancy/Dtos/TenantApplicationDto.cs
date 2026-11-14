namespace OnePortal.Application.UseCases.V1.Tenancy.Dtos;

public sealed record TenantApplicationDto(string AppKey, bool IsEnabled, bool AllowSelfRegistration, string ProvisioningStatus, int SeedVersion, string? LastInitializationError);
