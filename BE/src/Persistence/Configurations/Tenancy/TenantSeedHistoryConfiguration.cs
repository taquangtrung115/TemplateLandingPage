namespace OnePortal.Persistence.Configurations.Tenancy;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.Tenancy;

public sealed class TenantSeedHistoryConfiguration : IEntityTypeConfiguration<TenantSeedHistory>
{
    public void Configure(EntityTypeBuilder<TenantSeedHistory> builder)
    {
        builder.ToTable("TenantSeedHistory", "platform"); builder.HasKey(history => history.Id);
        builder.Property(history => history.AppKey).HasMaxLength(32).IsRequired();
        builder.Property(history => history.SeedKey).HasMaxLength(100).IsRequired();
        builder.HasIndex(history => new { history.TenantId, history.AppKey, history.SeedKey, history.Version }).IsUnique();
    }
}
