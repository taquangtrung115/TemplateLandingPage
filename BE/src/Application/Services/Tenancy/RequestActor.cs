namespace OnePortal.Application.Services.Tenancy;

using OnePortal.Application.Abstractions;

public sealed class RequestActor : IRequestActor
{
    public Guid? UserId { get; private set; }
    public bool IsPlatformAdmin { get; private set; }
    public string? Role { get; private set; }
    public void Initialize(Guid userId, bool isPlatformAdmin, string? role)
    {
        UserId = userId; IsPlatformAdmin = isPlatformAdmin; Role = role;
    }
}
