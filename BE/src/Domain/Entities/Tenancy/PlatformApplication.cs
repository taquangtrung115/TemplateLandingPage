namespace OnePortal.Domain.Entities.Tenancy;

using OnePortal.Domain.Abstractions;

public sealed class PlatformApplication : GlobalEntity<string>
{
    public string Name { get; private set; } = string.Empty;
    private PlatformApplication() { }
    public static PlatformApplication Create(string key, string name) => new() { Id = key, Name = name };
}
