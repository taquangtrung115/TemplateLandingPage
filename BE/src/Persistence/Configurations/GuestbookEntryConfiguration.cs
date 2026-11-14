namespace OnePortal.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities;
using OnePortal.Persistence.Constants;

public sealed class GuestbookEntryConfiguration : IEntityTypeConfiguration<GuestbookEntry>
{
    public void Configure(EntityTypeBuilder<GuestbookEntry> builder)
    {
        builder.ToTable(TableNames.GuestbookEntries);

        builder.HasKey(g => g.Id);

        builder.Property(g => g.CustomizationId);
        builder.Property(g => g.CustomizationVersionId);
        builder.HasOne<CustomizationVersion>()
            .WithMany()
            .HasForeignKey(g => g.CustomizationVersionId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(g => new { g.CustomizationVersionId, g.CreatedAtUtc });

        builder.Property(g => g.SenderName)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(g => g.Message)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(g => g.CreatedAtUtc)
            .IsRequired();
    }
}
