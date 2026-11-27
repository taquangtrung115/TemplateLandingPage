namespace OnePortal.Persistence.Configurations.PhotoPrint;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed class PhotoSupportRequestConfiguration : IEntityTypeConfiguration<PhotoSupportRequest>
{
    public void Configure(EntityTypeBuilder<PhotoSupportRequest> builder)
    {
        builder.ToTable("SupportRequests", "photo");
        builder.HasIndex(entity => new { entity.TenantId, entity.TicketCode }).IsUnique();
        builder.HasIndex(entity => new { entity.TenantId, entity.Status, entity.CreatedAtUtc });
        builder.Property(entity => entity.Revision).IsConcurrencyToken();
    }
}
