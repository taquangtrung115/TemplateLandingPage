namespace OnePortal.Application.Abstractions;

public interface IRequestActor
{
    Guid? UserId { get; }
    bool IsPlatformAdmin { get; }
    string? Role { get; }
}
