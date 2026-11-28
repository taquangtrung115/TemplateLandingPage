namespace OnePortal.Persistence.Configurations.Tenancy;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.Tenancy;
using OnePortal.Domain.Entities.Users;

public sealed class TenantWorkspaceMembershipConfiguration : IEntityTypeConfiguration<TenantWorkspaceMembership>
{
    public void Configure(EntityTypeBuilder<TenantWorkspaceMembership> builder)
    {
        builder.ToTable("TenantWorkspaceMemberships", "platform");
        builder.HasIndex(member => new { member.TenantId, member.UserId }).IsUnique();
        builder.HasIndex(member => new { member.UserId, member.TenantId });
        builder.Property(member => member.Role).HasMaxLength(16).IsRequired();
        builder.HasOne<User>().WithMany().HasForeignKey(member => member.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}
