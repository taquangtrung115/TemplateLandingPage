namespace TemplateLandingPage.Persistence.Configurations.Quoting;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Persistence.Constants;

public sealed class QuotationConfiguration : IEntityTypeConfiguration<Quotation>
{
    public void Configure(EntityTypeBuilder<Quotation> builder)
    {
        builder.ToTable(TableNames.Quotations, TableNames.QuotingSchema);

        builder.HasKey(q => q.Id);
        builder.Property(q => q.Id).ValueGeneratedNever();

        builder.Property(q => q.QuotationNumber)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(q => q.QuotationNumber)
            .IsUnique();

        builder.Property(q => q.CustomerId)
            .IsRequired(false);

        builder.Property(q => q.CustomerName)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(q => q.CustomerContactPerson)
            .HasMaxLength(150);

        builder.Property(q => q.CustomerPhone)
            .HasMaxLength(50);

        builder.Property(q => q.CustomerEmail)
            .HasMaxLength(150);

        builder.Property(q => q.CustomerAddress)
            .HasMaxLength(500);

        builder.Property(q => q.CustomerTaxCode)
            .HasMaxLength(50);

        builder.Property(q => q.TemplateId)
            .IsRequired();

        builder.Property(q => q.TemplateVersion)
            .IsRequired();

        builder.Property(q => q.Status)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(q => q.IssueDate)
            .IsRequired();

        builder.Property(q => q.ValidUntil);

        builder.Property(q => q.SubTotal)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(q => q.DiscountPercent)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(q => q.DiscountAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(q => q.TaxPercent)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(q => q.TaxAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(q => q.TotalAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(q => q.Notes)
            .HasMaxLength(2000);

        builder.Property(q => q.CreatedByUserId)
            .IsRequired();

        builder.Property(q => q.IsDeleted)
            .IsRequired();

        builder.Property(q => q.DeletedAtUtc);
        builder.Property(q => q.CreatedAtUtc).IsRequired();
        builder.Property(q => q.ModifiedAtUtc);

        builder.HasMany(q => q.Items)
            .WithOne()
            .HasForeignKey(i => i.QuotationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(q => q.Histories)
            .WithOne()
            .HasForeignKey(h => h.QuotationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(q => q.Files)
            .WithOne()
            .HasForeignKey(f => f.QuotationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(q => q.DomainEvents);
        builder.HasQueryFilter(q => !q.IsDeleted);
    }
}
