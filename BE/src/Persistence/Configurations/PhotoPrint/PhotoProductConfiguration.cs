namespace OnePortal.Persistence.Configurations.PhotoPrint;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed class PhotoProductConfiguration : IEntityTypeConfiguration<PhotoProduct>
{
    public void Configure(EntityTypeBuilder<PhotoProduct> builder)
    {
        builder.ToTable("Products", "photo");
        builder.HasIndex(entity => new { entity.TenantId, entity.Code }).IsUnique().HasDatabaseName("IX_PhotoProducts_TenantId_Code");
        builder.HasIndex(entity => new { entity.TenantId, entity.Slug }).IsUnique();
        builder.HasIndex(entity => new { entity.TenantId, entity.IsActive, entity.IsDeleted, entity.IsFeatured });
        builder.Property(entity => entity.GalleryJson).HasColumnType("jsonb");
        builder.Property(entity => entity.PrintSizesJson).HasColumnType("jsonb");
        builder.Property(entity => entity.PaperOrSurfaceOptionsJson).HasColumnType("jsonb");
        builder.Property(entity => entity.FinishingOptionsJson).HasColumnType("jsonb");
        builder.Property(entity => entity.DiscountTiersJson).HasColumnType("jsonb");
        builder.Property(entity => entity.UsageTypesJson).HasColumnType("jsonb");
        builder.HasOne<PhotoCategory>().WithMany().HasForeignKey(entity => entity.CategoryId).OnDelete(DeleteBehavior.Restrict);
    }
}
