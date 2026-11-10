namespace TemplateLandingPage.Persistence.Configurations.Quoting;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Persistence.Constants;

public sealed class QuotingProductConfiguration : IEntityTypeConfiguration<QuotingProduct>
{
    public void Configure(EntityTypeBuilder<QuotingProduct> builder)
    {
        builder.ToTable(TableNames.QuotingProducts, TableNames.QuotingSchema);

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedNever();

        builder.Property(p => p.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(p => p.Code)
            .IsUnique();

        builder.Property(p => p.Name)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.Unit)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(p => p.Price)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(p => p.ImageUrl)
            .HasMaxLength(1000);

        builder.HasOne(p => p.Group).WithMany().HasForeignKey(p => p.GroupId).OnDelete(DeleteBehavior.Restrict);

        builder.Property(p => p.Category)
            .HasMaxLength(100);

        builder.Property(p => p.IsActive)
            .IsRequired();

        builder.Property(p => p.IsDeleted)
            .IsRequired();

        builder.Property(p => p.DeletedAtUtc);
        builder.Property(p => p.CreatedAtUtc).IsRequired();
        builder.Property(p => p.ModifiedAtUtc);

        builder.Ignore(p => p.DomainEvents);
        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}
