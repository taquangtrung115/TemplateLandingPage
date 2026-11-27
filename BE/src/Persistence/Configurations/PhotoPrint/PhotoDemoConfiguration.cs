namespace OnePortal.Persistence.Configurations.PhotoPrint;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed class PhotoDemoConfiguration : IEntityTypeConfiguration<PhotoDemo>
{
    public void Configure(EntityTypeBuilder<PhotoDemo> builder)
    {
        builder.ToTable("Demos", "photo");
        builder.HasOne<PhotoProduct>().WithMany().HasForeignKey(entity => entity.LinkedProductId).OnDelete(DeleteBehavior.Restrict);
    }
}
