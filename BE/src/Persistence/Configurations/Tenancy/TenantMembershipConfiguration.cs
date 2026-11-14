namespace OnePortal.Persistence.Configurations.Tenancy;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Entities.Tenancy;

public sealed class TenantMembershipConfiguration : IEntityTypeConfiguration<TenantMembership>
{
    public void Configure(EntityTypeBuilder<TenantMembership> builder)
    {
        builder.ToTable("TenantMemberships", "platform"); builder.HasKey(membership => membership.Id);
        builder.Property(membership => membership.AppKey).HasMaxLength(32).IsRequired();
        builder.Property(membership => membership.Role).HasMaxLength(20).IsRequired();
        builder.HasIndex(membership => new { membership.TenantId, membership.AppKey, membership.UserId }).IsUnique();
        builder.HasIndex(membership => membership.UserId);
        builder.HasOne<User>().WithMany().HasForeignKey(membership => membership.UserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<TenantApplication>().WithMany().HasForeignKey(membership => new { membership.TenantId, membership.AppKey })
            .HasPrincipalKey(application => new { application.TenantId, application.AppKey }).OnDelete(DeleteBehavior.Restrict);
    }
}
