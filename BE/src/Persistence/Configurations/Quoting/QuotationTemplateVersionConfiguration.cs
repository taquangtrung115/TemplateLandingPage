namespace OnePortal.Persistence.Configurations.Quoting;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Persistence.Constants;

public sealed class QuotationTemplateVersionConfiguration : IEntityTypeConfiguration<QuotationTemplateVersion>
{
    public void Configure(EntityTypeBuilder<QuotationTemplateVersion> builder)
    {
        builder.ToTable(TableNames.QuotationTemplateVersions, TableNames.QuotingSchema);

        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).ValueGeneratedNever();

        builder.Property(v => v.TemplateId)
            .IsRequired();

        builder.Property(v => v.Version)
            .IsRequired();

        builder.HasIndex(v => new { v.TemplateId, v.Version })
            .IsUnique();

        builder.Property(v => v.Title)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(v => v.SellerInfoJson)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(v => v.SalutationText)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(v => v.ColumnsConfigJson)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(v => v.PaymentTermsJson)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(v => v.SignatureConfigJson)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(v => v.CustomCss)
            .HasColumnType("text");

        builder.Property(v => v.IsPublished)
            .IsRequired();

        builder.Property(v => v.CreatedAtUtc)
            .IsRequired();

        builder.Property(v => v.CreatedByUserId);
    }
}
