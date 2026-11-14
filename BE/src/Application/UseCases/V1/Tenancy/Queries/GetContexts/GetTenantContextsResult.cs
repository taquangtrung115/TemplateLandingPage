namespace OnePortal.Application.UseCases.V1.Tenancy.Queries.GetContexts;

using OnePortal.Application.UseCases.V1.Tenancy.Dtos;

public sealed record GetTenantContextsResult(IReadOnlyList<TenantContextDto> Items);
