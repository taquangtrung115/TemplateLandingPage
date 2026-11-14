namespace OnePortal.Application.UseCases.V1.Tenancy.Dtos;

public sealed record TenantContextDto(Guid TenantId, string TenantKey, string TenantName, string AppKey, string Role);
