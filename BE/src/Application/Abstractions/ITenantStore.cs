namespace OnePortal.Application.Abstractions;

using OnePortal.Application.UseCases.V1.Tenancy.Dtos;
using OnePortal.Contract.Abstractions.Shared;

public interface ITenantStore
{
    Task<IReadOnlyList<TenantDto>> SearchAsync(int page, int pageSize, CancellationToken cancellationToken);
    Task<IReadOnlyList<TenantContextDto>> GetContextsAsync(Guid userId, string appKey, int page, int pageSize, CancellationToken cancellationToken);
    Task<IReadOnlyList<TenantMemberDto>> GetMembersAsync(Guid tenantId, string appKey, int page, int pageSize, CancellationToken cancellationToken);
    Task<Result<TenantDto>> CreateAsync(string key, string name, string[] applications, string? adminEmail, CancellationToken cancellationToken);
    Task<Result<TenantDto>> UpdateAsync(Guid tenantId, string name, bool isActive, CancellationToken cancellationToken);
    Task<Result<TenantDto>> ConfigureApplicationAsync(Guid tenantId, string appKey, bool isEnabled, bool allowSelfRegistration, CancellationToken cancellationToken);
    Task<Result<TenantMemberDto>> SetMembershipAsync(Guid tenantId, string appKey, string email, string role, bool isActive, CancellationToken cancellationToken);
}
