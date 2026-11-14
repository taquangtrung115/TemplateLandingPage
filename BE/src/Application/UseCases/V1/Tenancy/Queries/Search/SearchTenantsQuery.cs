namespace OnePortal.Application.UseCases.V1.Tenancy.Queries.Search;

using OnePortal.Contract.Abstractions.Message;

public sealed record SearchTenantsQuery(int Page = 1, int PageSize = 20, string? Search = null) : IQuery<SearchTenantsResult>;
