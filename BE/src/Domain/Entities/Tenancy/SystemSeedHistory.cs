namespace OnePortal.Domain.Entities.Tenancy;

using OnePortal.Domain.Abstractions;

public sealed class SystemSeedHistory : GlobalEntity<string>
{
    public int Version { get; private set; }
    public DateTime CompletedAtUtc { get; private set; }
    private SystemSeedHistory() { }
    public static SystemSeedHistory Complete(string key, int version) => new() { Id = key, Version = version, CompletedAtUtc = DateTime.UtcNow };
}
