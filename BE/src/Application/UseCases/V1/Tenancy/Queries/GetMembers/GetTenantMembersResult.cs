namespace OnePortal.Application.UseCases.V1.Tenancy.Queries.GetMembers;

using OnePortal.Application.UseCases.V1.Tenancy.Dtos;

public sealed record GetTenantMembersResult(IReadOnlyList<TenantMemberDto> Items);
