namespace OnePortal.Domain.Entities.Tenancy;

public static class TenantDefaults
{
    public static readonly Guid LandingId = Guid.Parse("6ba7809b-1af1-42ad-80e7-a2da9d58c001");
    public static readonly Guid QuotingId = Guid.Parse("6ba7809b-1af1-42ad-80e7-a2da9d58c002");
    public static readonly string[] ApplicationKeys = ["landing", "quoting"];
}
