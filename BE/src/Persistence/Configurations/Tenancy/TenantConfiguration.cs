namespace OnePortal.Persistence.Configurations.Tenancy;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.Tenancy;

public sealed class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("Tenants", "platform"); builder.HasKey(tenant => tenant.Id);
        builder.Property(tenant => tenant.Key).HasMaxLength(63).IsRequired();
        builder.Property(tenant => tenant.Name).HasMaxLength(200).IsRequired();
        builder.HasIndex(tenant => tenant.Key).IsUnique();
    }
}
