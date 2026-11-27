namespace OnePortal.Domain.Entities.Tenancy;

using System.Diagnostics.CodeAnalysis;

public static class TenantDefaults
{
    public static readonly Guid LandingId = Guid.Parse("6ba7809b-1af1-42ad-80e7-a2da9d58c001");
    public static readonly Guid QuotingId = Guid.Parse("6ba7809b-1af1-42ad-80e7-a2da9d58c002");
    public static readonly Guid PhotoPrintId = Guid.Parse("6ba7809b-1af1-42ad-80e7-a2da9d58c004");
    public static readonly string[] ApplicationKeys = ["landing", "quoting", "photoprint"];
    public static bool IsSupportedApplication([NotNullWhen(true)] string? appKey) => appKey is not null && ApplicationKeys.Contains(appKey);
}
