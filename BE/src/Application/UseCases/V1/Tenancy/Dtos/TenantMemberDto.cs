namespace OnePortal.Application.UseCases.V1.Tenancy.Dtos;

public sealed record TenantMemberDto(Guid Id, string Email, string FullName, string Role, bool IsActive, bool AccountIsActive);
