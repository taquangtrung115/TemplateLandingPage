namespace OnePortal.Persistence.Configurations.PhotoPrint;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed class PhotoOrderConfiguration : IEntityTypeConfiguration<PhotoOrder>
{
    public void Configure(EntityTypeBuilder<PhotoOrder> builder)
    {
        builder.ToTable("Orders", "photo");
        builder.HasIndex(entity => new { entity.TenantId, entity.OrderCode }).IsUnique();
        builder.HasIndex(entity => new { entity.TenantId, entity.Status, entity.CreatedAtUtc });
        builder.Property(entity => entity.Revision).IsConcurrencyToken();
        builder.Property(entity => entity.PaymentStatus).HasMaxLength(20).HasDefaultValue("Unpaid");
        builder.HasMany(entity => entity.Items).WithOne().HasForeignKey(item => item.OrderId).OnDelete(DeleteBehavior.Cascade);
    }
}
