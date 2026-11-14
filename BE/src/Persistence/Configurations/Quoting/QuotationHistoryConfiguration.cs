namespace OnePortal.Persistence.Configurations.Quoting;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Persistence.Constants;

public sealed class QuotationHistoryConfiguration : IEntityTypeConfiguration<QuotationHistory>
{
    public void Configure(EntityTypeBuilder<QuotationHistory> builder)
    {
        builder.ToTable(TableNames.QuotationHistories, TableNames.QuotingSchema);

        builder.HasKey(h => h.Id);
        builder.Property(h => h.Id).ValueGeneratedNever();

        builder.Property(h => h.QuotationId)
            .IsRequired();

        builder.Property(h => h.Action)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(h => h.Description)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(h => h.SnapshotData)
            .HasColumnType("text");

        builder.Property(h => h.CreatedByUserId)
            .IsRequired();

        builder.Property(h => h.CreatedAtUtc)
            .IsRequired();
    }
}
