namespace OnePortal.Persistence.Configurations.PhotoPrint;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed class PhotoOrderItemConfiguration : IEntityTypeConfiguration<PhotoOrderItem>
{
    public void Configure(EntityTypeBuilder<PhotoOrderItem> builder)
    {
        builder.ToTable("OrderItems", "photo");
        builder.Property(entity => entity.PhotoFilesJson).HasColumnType("jsonb");
        builder.Property(entity => entity.ProductOptionsJson).HasColumnType("jsonb");
        builder.HasOne<PhotoProduct>().WithMany().HasForeignKey(entity => entity.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}
