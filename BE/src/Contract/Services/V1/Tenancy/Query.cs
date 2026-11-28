namespace OnePortal.Contract.Services.V1.Tenancy;

using OnePortal.Contract.Abstractions.Message;

public sealed record GetTenantContextsQuery(string AppKey, int Page = 1, int PageSize = 100) : IQuery<GetTenantContextsResult>;

public sealed record GetTenantMembersQuery(Guid TenantId, string AppKey, int Page = 1, int PageSize = 20) : IQuery<GetTenantMembersResult>;

public sealed record GetRegistrationQuery : IQuery<GetRegistrationResult>;

public sealed record GetWorkspaceApplicationsQuery(string TenantKey) : IQuery<GetWorkspaceApplicationsResult>;

public sealed record SearchTenantsQuery(int Page = 1, int PageSize = 20, string? Search = null) : IQuery<SearchTenantsResult>;

public sealed record GetTenantDetailQuery(Guid? TenantId, string? TenantKey = null) : IQuery<TenantDto>;
public sealed record GetTenantUsersQuery(Guid TenantId, string? Search = null, int Page = 1, int PageSize = 20) : IQuery<GetTenantUsersResult>;
