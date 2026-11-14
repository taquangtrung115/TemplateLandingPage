namespace OnePortal.Application.Abstractions;

public interface ITenantContext
{
    Guid? TenantId { get; }
    string? AppKey { get; }
    string? TenantKey { get; }
}
