namespace TemplateLandingPage.Persistence.Configurations.Quoting;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Persistence.Constants;

public sealed class QuotationItemConfiguration : IEntityTypeConfiguration<QuotationItem>
{
    public void Configure(EntityTypeBuilder<QuotationItem> builder)
    {
        builder.ToTable(TableNames.QuotationItems, TableNames.QuotingSchema);

        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedNever();

        builder.Property(i => i.QuotationId)
            .IsRequired();

        builder.Property(i => i.ProductId);

        builder.Property(i => i.ProductCode)
            .HasMaxLength(50);

        builder.Property(i => i.ProductName)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(i => i.Description)
            .HasMaxLength(1000);

        builder.Property(i => i.Unit)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(i => i.ImageUrl)
            .HasMaxLength(1000);

        builder.Property(i => i.ItemGroup)
            .HasMaxLength(150);

        builder.Property(i => i.Quantity)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(i => i.UnitPrice)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(i => i.DiscountPercent)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(i => i.DiscountAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(i => i.TotalAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(i => i.Notes)
            .HasMaxLength(500);

        builder.Property(i => i.SortOrder)
            .IsRequired();
    }
}
