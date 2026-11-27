namespace OnePortal.Persistence.Configurations.PhotoPrint;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed class PhotoContactConfigConfiguration : IEntityTypeConfiguration<PhotoContactConfig>
{
    public void Configure(EntityTypeBuilder<PhotoContactConfig> builder)
    {
        builder.ToTable("ContactConfigs", "photo");
        builder.HasIndex(entity => entity.TenantId).IsUnique();
    }
}
