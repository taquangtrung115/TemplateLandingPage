namespace OnePortal.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities;
using OnePortal.Persistence.Constants;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable(TableNames.Categories);

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(c => c.Slug)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(c => c.Slug)
            .IsUnique();

        builder.Property(c => c.Description)
            .HasMaxLength(1000);

        builder.Property(c => c.Icon)
            .HasMaxLength(100);

        builder.Property(c => c.OrderIndex)
            .IsRequired();

        builder.Property(c => c.IsActive)
            .IsRequired();

        builder.Property(c => c.IsDeleted)
            .IsRequired();

        builder.Property(c => c.DeletedAtUtc);
        builder.Property(c => c.CreatedAtUtc).IsRequired();
        builder.Property(c => c.ModifiedAtUtc);

        builder.Ignore(c => c.DomainEvents);

        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}
