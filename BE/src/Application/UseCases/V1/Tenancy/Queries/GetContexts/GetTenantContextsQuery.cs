namespace OnePortal.Application.UseCases.V1.Tenancy.Queries.GetContexts;

using OnePortal.Contract.Abstractions.Message;

public sealed record GetTenantContextsQuery(string AppKey, int Page = 1, int PageSize = 100) : IQuery<GetTenantContextsResult>;
