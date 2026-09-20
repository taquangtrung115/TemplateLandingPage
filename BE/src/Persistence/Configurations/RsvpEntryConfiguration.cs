namespace TemplateLandingPage.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Persistence.Constants;

public sealed class RsvpEntryConfiguration : IEntityTypeConfiguration<RsvpEntry>
{
    public void Configure(EntityTypeBuilder<RsvpEntry> builder)
    {
        builder.ToTable(TableNames.RsvpEntries);

        builder.HasKey(r => r.Id);

        builder.Property(r => r.CustomizationId);

        builder.Property(r => r.GuestName)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(r => r.Email)
            .HasMaxLength(255);

        builder.Property(r => r.Phone)
            .HasMaxLength(50);

        builder.Property(r => r.AttendingStatus)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(r => r.NumberOfGuests)
            .IsRequired();

        builder.Property(r => r.DietaryNotes)
            .HasMaxLength(500);

        builder.Property(r => r.Wishes)
            .HasMaxLength(1000);

        builder.Property(r => r.CreatedAtUtc)
            .IsRequired();
    }
}
