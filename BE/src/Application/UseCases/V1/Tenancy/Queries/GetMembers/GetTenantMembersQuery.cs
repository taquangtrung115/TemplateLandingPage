namespace OnePortal.Application.UseCases.V1.Tenancy.Queries.GetMembers;

using OnePortal.Contract.Abstractions.Message;

public sealed record GetTenantMembersQuery(Guid TenantId, string AppKey, int Page = 1, int PageSize = 20) : IQuery<GetTenantMembersResult>;
