namespace OnePortal.Application.UseCases.V1.Tenancy.Dtos;

public sealed record TenantDto(Guid Id, string Key, string Name, bool IsActive, IReadOnlyList<TenantApplicationDto> Applications);
