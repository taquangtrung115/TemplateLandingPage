namespace OnePortal.Application.UseCases.V1.Tenancy.Dtos;

public sealed record RegistrationSettingsDto(string TenantName, string AppKey, bool AllowSelfRegistration);
