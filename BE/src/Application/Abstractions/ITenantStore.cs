namespace OnePortal.Application.Abstractions;

using OnePortal.Contract.Services.V1.Tenancy;
using OnePortal.Contract.Abstractions.Shared;

public interface ITenantStore
{
    Task<IReadOnlyList<TenantDto>> SearchAsync(int page, int pageSize, CancellationToken cancellationToken, string? search = null);
    Task<WorkspaceApplicationsDto?> GetWorkspaceApplicationsAsync(string tenantKey, CancellationToken cancellationToken);
    Task<RegistrationSettingsDto?> GetRegistrationAsync(Guid tenantId, string appKey, CancellationToken cancellationToken);
    Task<Result<RegistrationSettingsDto>> ConfigureRegistrationAsync(Guid tenantId, string appKey, bool allowSelfRegistration, CancellationToken cancellationToken);
    Task<Result<TenantMemberDto>> CreateMemberAsync(Guid tenantId, string appKey, string email, string fullName, string passwordHash, string role, CancellationToken cancellationToken);
    Task<IReadOnlyList<TenantContextDto>> GetContextsAsync(Guid userId, string appKey, int page, int pageSize, CancellationToken cancellationToken);
    Task<IReadOnlyList<TenantMemberDto>> GetMembersAsync(Guid tenantId, string appKey, int page, int pageSize, CancellationToken cancellationToken);
    Task<Result<TenantDto>> CreateAsync(string key, string name, string[] applications, string? adminEmail, CancellationToken cancellationToken);
    Task<Result<TenantDto>> UpdateAsync(Guid tenantId, string name, bool isActive, CancellationToken cancellationToken);
    Task<Result<TenantDto>> ConfigureApplicationAsync(Guid tenantId, string appKey, bool isEnabled, bool allowSelfRegistration, CancellationToken cancellationToken);
    Task<Result<TenantMemberDto>> SetMembershipAsync(Guid tenantId, string appKey, string email, string role, bool isActive, CancellationToken cancellationToken);
    Task<TenantDto?> GetDetailAsync(Guid? tenantId, string? tenantKey, CancellationToken cancellationToken);
    Task<Result<GetTenantUsersResult>> GetTenantUsersAsync(Guid tenantId, string? search, int page, int pageSize, CancellationToken cancellationToken);
    Task<Result<bool>> DeleteAsync(Guid tenantId, string confirmKey, bool force, CancellationToken cancellationToken);
    Task<Result<TenantDto>> UninstallApplicationAsync(Guid tenantId, string appKey, bool purgeData, CancellationToken cancellationToken);
    Task<Result<bool>> RemoveMembershipAsync(Guid tenantId, string appKey, Guid userId, CancellationToken cancellationToken);
    Task<Result<TenantMemberDto>> UpdateMemberProfileAsync(Guid tenantId, Guid userId, string fullName, string? passwordHash, CancellationToken cancellationToken, string? appKey = null);
    Task<Result<bool>> SetWorkspaceMembershipAsync(Guid tenantId, string email, string? role, string? fullName, string? passwordHash, CancellationToken cancellationToken);
}
