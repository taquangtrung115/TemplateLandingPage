namespace OnePortal.Persistence.Configurations.Tenancy;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.Tenancy;

public sealed class PlatformApplicationConfiguration : IEntityTypeConfiguration<PlatformApplication>
{
    public void Configure(EntityTypeBuilder<PlatformApplication> builder)
    {
        builder.ToTable("Applications", "platform"); builder.HasKey(application => application.Id);
        builder.Property(application => application.Id).HasMaxLength(32);
        builder.Property(application => application.Name).HasMaxLength(100).IsRequired();
    }
}
