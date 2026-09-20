namespace TemplateLandingPage.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Persistence.Constants;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable(TableNames.Products);

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.Price)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(p => p.IsActive)
            .IsRequired();

        builder.Property(p => p.IsDeleted)
            .IsRequired();

        builder.Property(p => p.DeletedAtUtc);

        builder.Property(p => p.CreatedAtUtc)
            .IsRequired();

        builder.Property(p => p.ModifiedAtUtc);

        builder.Ignore(p => p.DomainEvents);

        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}
