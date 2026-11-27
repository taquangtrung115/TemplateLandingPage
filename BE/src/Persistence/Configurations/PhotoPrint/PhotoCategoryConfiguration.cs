namespace OnePortal.Persistence.Configurations.PhotoPrint;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed class PhotoCategoryConfiguration : IEntityTypeConfiguration<PhotoCategory>
{
    public void Configure(EntityTypeBuilder<PhotoCategory> builder)
    {
        builder.ToTable("Categories", "photo");
        builder.HasIndex(entity => new { entity.TenantId, entity.Slug }).IsUnique().HasDatabaseName("IX_PhotoCategories_TenantId_Slug");
        builder.HasIndex(entity => new { entity.TenantId, entity.IsActive, entity.IsDeleted, entity.SortOrder });
    }
}
