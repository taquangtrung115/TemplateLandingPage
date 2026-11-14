namespace OnePortal.Application.UseCases.V1.Tenancy.Commands.SetMembership;

using OnePortal.Application.UseCases.V1.Tenancy.Dtos;

public sealed record SetTenantMembershipResult(TenantMemberDto Member);
