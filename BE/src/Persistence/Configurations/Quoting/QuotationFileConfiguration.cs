namespace OnePortal.Persistence.Configurations.Quoting;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Persistence.Constants;

public sealed class QuotationFileConfiguration : IEntityTypeConfiguration<QuotationFile>
{
    public void Configure(EntityTypeBuilder<QuotationFile> builder)
    {
        builder.ToTable(TableNames.QuotationFiles, TableNames.QuotingSchema);

        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id).ValueGeneratedNever();

        builder.Property(f => f.QuotationId)
            .IsRequired();

        builder.Property(f => f.FileName)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(f => f.FileType)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(f => f.FileUrl)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(f => f.FileSize)
            .IsRequired();

        builder.Property(f => f.StorageProvider)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(f => f.CreatedAtUtc)
            .IsRequired();

        builder.Property(f => f.CreatedByUserId)
            .IsRequired();
    }
}
