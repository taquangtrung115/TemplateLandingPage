namespace OnePortal.Application.UseCases.V1.Tenancy.Queries.Search;

using OnePortal.Application.UseCases.V1.Tenancy.Dtos;

public sealed record SearchTenantsResult(IReadOnlyList<TenantDto> Items);
