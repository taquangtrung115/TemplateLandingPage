namespace OnePortal.Persistence.Configurations.Tenancy;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.Tenancy;

public sealed class SystemSeedHistoryConfiguration : IEntityTypeConfiguration<SystemSeedHistory>
{
    public void Configure(EntityTypeBuilder<SystemSeedHistory> builder)
    {
        builder.ToTable("SystemSeedHistory", "platform"); builder.HasKey(history => history.Id);
        builder.Property(history => history.Id).HasMaxLength(100);
    }
}
