namespace OnePortal.Persistence.Configurations.Tenancy;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.Tenancy;

public sealed class TenantApplicationConfiguration : IEntityTypeConfiguration<TenantApplication>
{
    public void Configure(EntityTypeBuilder<TenantApplication> builder)
    {
        builder.ToTable("TenantApplications", "platform"); builder.HasKey(application => application.Id);
        builder.Property(application => application.AppKey).HasMaxLength(32).IsRequired();
        builder.Property(application => application.ProvisioningStatus).HasMaxLength(32).IsRequired();
        builder.Property(application => application.LastInitializationError).HasMaxLength(500);
        builder.HasAlternateKey(application => new { application.TenantId, application.AppKey });
        builder.HasOne<PlatformApplication>().WithMany().HasForeignKey(application => application.AppKey).OnDelete(DeleteBehavior.Restrict);
    }
}
